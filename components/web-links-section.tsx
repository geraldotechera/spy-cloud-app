"use client"

interface WebLinksSectionProps {
  onBack: () => void
}

export function WebLinksSection({ onBack }: WebLinksSectionProps) {
  const transportLinks = {
    trenes: [
      { name: "Renfe (España - AVE)", url: "https://www.renfe.com", description: "Madrid-Barcelona y más" },
      { name: "Trenitalia (Italia)", url: "https://www.trenitalia.com", description: "Trenes en Italia" },
      { name: "SNCF (Francia)", url: "https://www.sncf-connect.com", description: "París-Ámsterdam" },
      { name: "NS (Holanda)", url: "https://www.ns.nl", description: "Trenes en Países Bajos" },
      {
        name: "Bernina Express (Suiza)",
        url: "https://www.rhb.ch/en/panoramic-trains/bernina-express",
        description: "Tren panorámico",
      },
    ],
    aviones: [
      { name: "Vueling", url: "https://www.vueling.com", description: "Barcelona-París" },
      { name: "Iberia", url: "https://www.iberia.com", description: "Vuelos España" },
      { name: "KLM", url: "https://www.klm.com", description: "Ámsterdam-Milán" },
      { name: "Ryanair", url: "https://www.ryanair.com", description: "Vuelos low-cost" },
    ],
    ferries: [
      { name: "Caremar", url: "https://www.caremar.it", description: "Ferries a Capri" },
      { name: "NLG", url: "https://www.navlib.it", description: "Hidroalas Nápoles-Capri" },
    ],
  }

  const eventLinks = {
    madrid: [
      { name: "Museo del Prado", url: "https://www.museodelprado.es" },
      { name: "Museo Reina Sofía", url: "https://www.museoreinasofia.es" },
      { name: "Palacio Real", url: "https://www.patrimonionacional.es" },
    ],
    barcelona: [
      { name: "Sagrada Família", url: "https://sagradafamilia.org" },
      { name: "Park Güell", url: "https://parkguell.barcelona" },
      { name: "Museo Picasso", url: "https://www.museupicasso.bcn.cat" },
    ],
    paris: [
      { name: "Louvre", url: "https://www.louvre.fr" },
      { name: "Torre Eiffel", url: "https://www.toureiffel.paris" },
      { name: "Musée d'Orsay", url: "https://www.musee-orsay.fr" },
      { name: "Sainte-Chapelle", url: "https://www.sainte-chapelle.fr" },
      { name: "Centre Pompidou", url: "https://www.centrepompidou.fr" },
    ],
    amsterdam: [
      { name: "Rijksmuseum", url: "https://www.rijksmuseum.nl" },
      { name: "Casa de Ana Frank", url: "https://www.annefrank.org" },
    ],
    italia: [
      { name: "Uffizi (Florencia)", url: "https://www.uffizi.it" },
      { name: "Coliseo (Roma)", url: "https://www.coopculture.it" },
      { name: "Museos Vaticanos", url: "https://www.museivaticani.va" },
      { name: "Duomo de Milán", url: "https://www.duomomilano.it" },
      { name: "Palacio Ducal (Venecia)", url: "https://palazzoducale.visitmuve.it" },
      { name: "Torre de Pisa", url: "https://www.opapisa.it" },
      { name: "Galería Borghese (Roma)", url: "https://www.galleriaborghese.beniculturali.it" },
    ],
  }

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
      >
        ← Volver al Menú
      </button>

      <h2 className="text-xl font-bold">🌐 Enlaces Web Útiles</h2>

      {/* Transporte */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-3">🚆 Transporte</h3>

        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm mb-2 text-blue-300">Trenes</h4>
            <div className="space-y-2">
              {transportLinks.trenes.map((link) => (
                <button
                  key={link.name}
                  onClick={() => window.open(link.url, "_blank")}
                  className="w-full bg-white/5 hover:bg-white/10 rounded-lg p-2 text-left transition-colors"
                >
                  <p className="font-medium text-sm">{link.name}</p>
                  <p className="text-xs text-white/70">{link.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2 text-green-300">Aviones</h4>
            <div className="space-y-2">
              {transportLinks.aviones.map((link) => (
                <button
                  key={link.name}
                  onClick={() => window.open(link.url, "_blank")}
                  className="w-full bg-white/5 hover:bg-white/10 rounded-lg p-2 text-left transition-colors"
                >
                  <p className="font-medium text-sm">{link.name}</p>
                  <p className="text-xs text-white/70">{link.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2 text-cyan-300">Ferries</h4>
            <div className="space-y-2">
              {transportLinks.ferries.map((link) => (
                <button
                  key={link.name}
                  onClick={() => window.open(link.url, "_blank")}
                  className="w-full bg-white/5 hover:bg-white/10 rounded-lg p-2 text-left transition-colors"
                >
                  <p className="font-medium text-sm">{link.name}</p>
                  <p className="text-xs text-white/70">{link.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Museos y Eventos */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-3">🎭 Museos y Atracciones</h3>

        <div className="space-y-3">
          {Object.entries(eventLinks).map(([city, links]) => (
            <div key={city}>
              <h4 className="font-medium text-sm mb-2 text-yellow-300 capitalize">{city}</h4>
              <div className="space-y-2">
                {links.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => window.open(link.url, "_blank")}
                    className="w-full bg-white/5 hover:bg-white/10 rounded-lg p-2 text-left transition-colors"
                  >
                    <p className="font-medium text-sm">{link.name}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
