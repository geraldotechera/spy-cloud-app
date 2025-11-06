# spy_dashboard_cloud.py — v3 (limpio + robusto)
# - Google Sheets como BD
# - Normaliza coma/punto y prices mal escalados
# - Botón SELL 25%
# - Gráfico de evolución

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

# ---- Secrets (compat raíz y [app_config]) ----
GCP_SA = st.secrets.get("gcp_service_account", None)
_cfg = st.secrets.get("app_config", {})

SHEET_ID = st.secrets.get("SHEET_ID", _cfg.get("SHEET_ID", ""))
BOT_TOKEN = st.secrets.get("BOT_TOKEN", _cfg.get("BOT_TOKEN", ""))
CHAT_ID  = st.secrets.get("CHAT_ID",  _cfg.get("CHAT_ID", ""))
TICKER   = st.secrets.get("TICKER",   _cfg.get("TICKER", "SPY")).upper()

if not GCP_SA or not SHEET_ID:
    st.error("Faltan secrets: gcp_service_account y/o SHEET_ID.")
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

# ---------- Helpers ----------
def _to_float(x, default=0.0):
    """Convierte strings con coma o punto a float. Maneja None."""
    if x is None:
        return float(default)
    s = str(x).strip().replace(" ", "")
    if s == "":
        return float(default)
    # cambiar coma por punto
    s = s.replace(",", ".")
    try:
        v = float(s)
    except:
        return float(default)
    # arreglar precios desescalados (ej: 67259 -> 672.59)
    if v > 10000:  # heurística segura para SPY u otros ETFs
        v = v / 100.0
    return float(v)

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
    # normalizar
    df["amount_usd"] = df["amount_usd"].map(_to_float)
    df["price"] = df["price"].map(_to_float)
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"], errors="coerce").dt.date
    return df

def append_ledger(row: dict):
    sh = open_sheet(SHEET_ID)
    ws = sh.worksheet(LEDGER_SHEET)
    ws.append_row([
        row.get("date",""),
        row.get("type",""),
        _to_float(row.get("amount_usd", 0)),
        _to_float(row.get("price", 0)),
        row.get("note","")
    ])
    st.cache_data.clear()  # refrescar caches

def compute_portfolio(df: pd.DataFrame):
    cash = units = cost_basis = realized_pl = 0.0
    for _, r in df.sort_values("date").iterrows():
        t = (r.get("type") or "").upper()
        amt = _to_float(r.get("amount_usd", 0))
        price = _to_float(r.get("price", 0))
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
    if df.empty:
        return pd.DataFrame()
    start = pd.to_datetime(df["date"].min())
    end   = pd.to_datetime(pd.Timestamp.utcnow().date())
    days = pd.date_range(start, end, freq="D")

    hist = yf.Ticker(ticker).history(
        start=start.strftime("%Y-%m-%d"),
        end=(end + pd.Timedelta(days=1)).strftime("%Y-%m-%d"),
        interval="1d"
    )
    if hist.empty:
        return pd.DataFrame()
    prices = hist["Close"].copy()
    prices.index = prices.index.tz_localize(None).date

    df2 = df.sort_values("date").copy()
    cash = units = cost_basis = 0.0
    out = []
    tx_by_day = df2.groupby("date")
    for d in days:
        ddate = d.date()
        if ddate in tx_by_day.groups:
            for _, r in tx_by_day.get_group(ddate).iterrows():
                t = (r["type"] or "").upper()
                amt = _to_float(r["amount_usd"])
                p   = _to_float(r["price"])
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
    return pd.DataFrame(out)

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

# ----- Acciones rápidas -----
st.subheader("⚡ Acciones rápidas")
colv1, colv2 = st.columns(2)
with colv1:
    disabled = (units <= 0 or price <= 0)
    if st.button("Vender 25% de la posición", use_container_width=True, disabled=disabled):
        qty = units * 0.25
        amount = qty * price
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
    st.caption("El monto se calcula con el precio actual. Podés ajustar luego en el ledger.")

st.divider()

# ----- Gráfico -----
st.subheader("📊 Evolución de cartera")
ts = build_timeseries(ledger, TICKER)
if ts.empty:
    st.info("Cargá movimientos en el ledger para ver la evolución.")
else:
    st.line_chart(
        ts.set_index("date")[["total_value", "position_value", "cash"]],
        height=320, use_container_width=True
    )

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
        amount_in = st.text_input("Monto USD (usa punto para decimales)", value="50.00")
    with c2:
        price_in = st.text_input("Precio SPY (solo BUY/SELL)", value=f"{price:.2f}")
        note = st.text_input("Nota", value="")
    submitted = st.form_submit_button("Guardar", use_container_width=True)

    if submitted:
        try:
            amount = _to_float(amount_in)
            p_in = _to_float(price_in)
            if tx_type in ("BUY","SELL") and p_in <= 0:
                st.error("Precio válido requerido para BUY/SELL.")
            else:
                append_ledger({
                    "date": date,
                    "type": tx_type,
                    "amount_usd": round(amount, 2),
                    "price": round(p_in, 2) if tx_type in ("BUY","SELL") else 0,
                    "note": note
                })
                st.success("Movimiento guardado.")
                if BOT_TOKEN and CHAT_ID:
                    try:
                        px_txt = f" @ {p_in:.2f}" if tx_type in ("BUY","SELL") else ""
                        requests.post(
                            f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
                            json={"chat_id": CHAT_ID,
                                  "text": f"{tx_type}: ${amount:.2f}{px_txt} {TICKER}"},
                            timeout=10
                        )
                    except Exception:
                        pass
                st.rerun()
        except Exception as e:
            st.error(f"Error: {e}")

st.divider()
st.caption("Tip: si tenías una inversión previa, cargála como BUY con el monto total y el precio pagado. La app corrige comas y precios mal escalados.")





