# spy_dashboard_cloud.py — v2
# - Dashboard en Streamlit Cloud
# - Google Sheets como BD
# - Lectura de secrets desde raíz o [app_config]
# - Form para registrar DEPOSIT / WITHDRAWAL / BUY / SELL
# - Botón "Vender 25%" automático
# - Gráfico de evolución (valor de cartera + cash) reconstruido con datos diarios

import time
import pandas as pd
import streamlit as st
import requests
import yfinance as yf
import gspread
from google.oauth2.service_account import Credentials

st.set_page_config(page_title="SPY Cloud App", page_icon="📈", layout="centered")
st.title("📈 SPY Cloud App")
st.caption("Monitoreo 24/7 en la nube con Google Sheets como base de datos")

# ---- Secrets (compat: raíz y [app_config]) ----
GCP_SA = st.secrets.get("gcp_service_account", None)
_cfg = st.secrets.get("app_config", {})

SHEET_ID = st.secrets.get("SHEET_ID", _cfg.get("SHEET_ID", ""))
BOT_TOKEN = st.secrets.get("BOT_TOKEN", _cfg.get("BOT_TOKEN", ""))
CHAT_ID  = st.secrets.get("CHAT_ID",  _cfg.get("CHAT_ID", ""))
TICKER   = st.secrets.get("TICKER",   _cfg.get("TICKER", "SPY")).upper()

if not GCP_SA or not SHEET_ID:
    st.error("Faltan secrets: gcp_service_account y/o SHEET_ID. Configuralos en Streamlit Cloud.")
    st.stop()

# --- Google Sheets client ---
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]
creds = Credentials.from_service_account_info(GCP_SA, scopes=SCOPES)
client = gspread.authorize(creds)

def open_sheet(sheet_id: str):
    return client.open_by_key(sheet_id)

LEDGER_SHEET = "ledger"

@st.cache_data(ttl=60)
def get_price(ticker: str) -> float:
    t = yf.Ticker(ticker)
    df = t.history(period="1d", interval="1m")
    if df.empty:
        df = t.history(period="5d", interval="1d")
    return float(df["Close"].iloc[-1])

@st.cache_data(ttl=5)
def load_ledger() -> pd.DataFrame:
    sh = open_sheet(SHEET_ID)
    try:
        ws = sh.worksheet(LEDGER_SHEET)
    except gspread.WorksheetNotFound:
        ws = sh.add_worksheet(title=LEDGER_SHEET, rows=1000, cols=10)
        ws.append_row(["date","type","amount_usd","price","note"])
    rows = ws.get_all_records()
    df = pd.DataFrame(rows)
    if df.empty:
        df = pd.DataFrame(columns=["date","type","amount_usd","price","note"])
    df["amount_usd"] = pd.to_numeric(df["amount_usd"], errors="coerce").fillna(0.0)
    df["price"] = pd.to_numeric(df["price"], errors="coerce").fillna(0.0)
    # normalizar fecha
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"], errors="coerce").dt.date
    return df

def append_ledger(row: dict):
    sh = open_sheet(SHEET_ID)
    ws = sh.worksheet(LEDGER_SHEET)
    ws.append_row([
        row.get("date",""),
        row.get("type",""),
        row.get("amount_usd",0),
        row.get("price",0),
        row.get("note","")
    ])
    st.cache_data.clear()

def compute_portfolio(df: pd.DataFrame):
    cash = units = cost_basis = realized_pl = 0.0
    for _, r in df.sort_values("date").iterrows():
        t = (r.get("type") or "").upper()
        amt = float(r.get("amount_usd", 0))
        price = float(r.get("price", 0))
        if t == "DEPOSIT":
            cash += amt
        elif t == "WITHDRAWAL":
            cash -= amt
        elif t == "BUY" and price > 0:
            qty = amt / price
            cash -= amt
            cost_basis += amt
            units += qty
        elif t == "SELL" and price > 0:
            qty = min(amt / price, units)
            proceeds = qty * price
            avg_cost = (cost_basis / units) if units > 0 else 0.0
            cost_removed = qty * avg_cost
            realized_pl += (proceeds - cost_removed)
            cost_basis -= cost_removed
            units -= qty
            cash += proceeds
    avg_cost = (cost_basis / units) if units > 0 else 0.0
    return cash, units, cost_basis, avg_cost, realized_pl

@st.cache_data(ttl=300)
def build_timeseries(df: pd.DataFrame, ticker: str):
    """Reconstruye series diarias: cash, unidades, valor, valor_total."""
    if df.empty:
        return pd.DataFrame()

    # Rango de fechas
    start = pd.to_datetime(df["date"].min())
    end   = pd.to_datetime(pd.Timestamp.utcnow().date())
    days = pd.date_range(start, end, freq="D")

    # Precios diarios
    hist = yf.Ticker(ticker).history(start=start.strftime("%Y-%m-%d"),
                                     end=(end + pd.Timedelta(days=1)).strftime("%Y-%m-%d"),
                                     interval="1d")
    if hist.empty:
        return pd.DataFrame()
    prices = hist["Close"].copy()
    prices.index = prices.index.tz_localize(None).date

    # Estado día a día
    df2 = df.sort_values("date").copy()
    cash = units = cost_basis = 0.0
    out = []
    tx_by_day = df2.groupby("date")
    for d in days:
        ddate = d.date()
        # aplicar transacciones del día
        if ddate in tx_by_day.groups:
            for _, r in tx_by_day.get_group(ddate).iterrows():
                t = (r["type"] or "").upper()
                amt = float(r["amount_usd"] or 0)
                p   = float(r["price"] or 0)
                if t == "DEPOSIT":
                    cash += amt
                elif t == "WITHDRAWAL":
                    cash -= amt
                elif t == "BUY" and p > 0:
                    qty = amt / p
                    cash -= amt
                    cost_basis += amt
                    units += qty
                elif t == "SELL" and p > 0:
                    qty = min(amt / p, units)
                    proceeds = qty * p
                    avg_cost = (cost_basis / units) if units > 0 else 0.0
                    cost_basis -= qty * avg_cost
                    units -= qty
                    cash += proceeds
        px = float(prices.get(ddate, prices.iloc[-1]))
        value = units * px
        total = cash + value
        out.append({"date": ddate, "cash": cash, "units": units, "price": px,
                    "position_value": value, "total_value": total})

    ts = pd.DataFrame(out)
    return ts

# ----- Header -----
c1, c2 = st.columns(2)
with c1:
    st.metric("Ticker", TICKER)
with c2:
    try:
        price = get_price(TICKER)
        st.metric("Precio actual", f"{price:.2f} USD")
    except Exception as e:
        price = 0.0
        st.warning(f"No se pudo leer el precio de {TICKER}: {e}")

# ----- Portfolio actual -----
ledger = load_ledger()
cash, units, cost_basis, avg_cost, realized_pl = compute_portfolio(ledger)
current_value = units * price
unrealized_pl = current_value - cost_basis
pnl_total = realized_pl + unrealized_pl

st.subheader("Resumen")
cc1, cc2 = st.columns(2)
with cc1:
    st.metric("Cash", f"{cash:.2f} USD")
    st.metric("Unidades", f"{units:.4f}")
with cc2:
    st.metric("Costo promedio", f"{avg_cost:.2f} USD")
    st.metric("Valor posición", f"{current_value:.2f} USD")
st.metric("P/L total", f"{pnl_total:.2f} USD",
          f"Realizada: {realized_pl:.2f} | No realizada: {unrealized_pl:.2f}")

st.divider()

# ----- Botón Vender 25% -----
st.subheader("⚡ Acciones rápidas")
colv1, colv2 = st.columns(2)
with colv1:
    if st.button("Vender 25% de la posición", use_container_width=True, disabled=(units<=0 or price<=0)):
        qty = units * 0.25
        amount = qty * price  # monto en USD que venderemos
        append_ledger({
            "date": time.strftime("%Y-%m-%d"),
            "type": "SELL",
            "amount_usd": round(amount, 2),
            "price": round(price, 2),
            "note": "sell_25_auto"
        })
        if BOT_TOKEN and CHAT_ID:
            try:
                requests.post(
                    f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
                    json={"chat_id": CHAT_ID,
                          "text": f"SELL 25%: ${amount:.2f} @ {price:.2f} {TICKER}"},
                    timeout=10
                )
            except Exception:
                pass
        st.success("Venta 25% registrada.")
        st.rerun()
with colv2:
    st.caption("El monto se calcula con el precio actual. Podés editar luego en el ledger si querés ajustar.")

st.divider()

# ----- Gráfico de evolución -----
st.subheader("📊 Evolución de cartera")
ts = build_timeseries(ledger, TICKER)
if ts.empty:
    st.info("Cargá movimientos en el ledger para ver la evolución.")
else:
    # Mostrar total_value y cash
    show = ts.set_index("date")[["total_value", "position_value", "cash"]]
    st.line_chart(show, height=320, use_container_width=True)

st.divider()

# ----- Ledger -----
st.subheader("🧾 Ledger de transacciones")
st.dataframe(ledger, use_container_width=True)

# ----- Form de nuevos movimientos -----
st.subheader("➕ Registrar movimiento")
with st.form("add_txn"):
    c1, c2 = st.columns(2)
    with c1:
        date = st.text_input("Fecha (AAAA-MM-DD)", value=time.strftime("%Y-%m-%d"))
        tx_type = st.selectbox("Tipo", ["DEPOSIT","WITHDRAWAL","BUY","SELL"], index=0)
        amount = st.number_input("Monto USD", min_value=0.0, value=50.0, step=1.0, format="%.2f")
    with c2:
        price_in = st.number_input("Precio SPY (solo BUY/SELL)", min_value=0.0, value=price, step=0.01, format="%.2f")
        note = st.text_input("Nota", value="")
    submitted = st.form_submit_button("Guardar", use_container_width=True)

    if submitted:
        try:
            if tx_type in ("BUY","SELL") and price_in <= 0:
                st.error("Precio válido requerido para BUY/SELL.")
            else:
                append_ledger({
                    "date": date,
                    "type": tx_type,
                    "amount_usd": round(amount, 2),
                    "price": round(price_in, 2) if tx_type in ("BUY","SELL") else 0,
                    "note": note
                })
                st.success("Movimiento guardado.")
                if BOT_TOKEN and CHAT_ID:
                    try:
                        requests.post(
                            f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
                            json={"chat_id": CHAT_ID,
                                  "text": f"{tx_type}: ${amount:.2f} @ {price_in if tx_type in ('BUY','SELL') else ''} {TICKER}"},
                            timeout=10
                        )
                    except Exception:
                        pass
                st.rerun()
        except Exception as e:
            st.error(f"Error: {e}")

st.divider()
st.caption("Nota: en SELL, el 'Monto USD' es el total que querés vender; la app calcula la cantidad con el precio.")




