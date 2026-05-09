// 1. Konfigurasi Server Publik
const geoserverUrl = "https://ahocevar.com/geoserver";
const layerName = "topp:states";

// 2. Setup Layer WMS
const wmsSource = new ol.source.TileWMS({
  url: `${geoserverUrl}/wms`,
  params: {
    LAYERS: layerName,
    TILED: true,
    VERSION: "1.1.1",
  },
  serverType: "geoserver",
  crossOrigin: "anonymous",
});
const wmsLayer = new ol.layer.Tile({
  source: wmsSource,
  title: "WMS Layer",
});

// 3. Setup Layer WFS
const wfsSource = new ol.source.Vector({
  format: new ol.format.GeoJSON(),
  url: function (extent) {
    let url = `${geoserverUrl}/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=${layerName}&outputFormat=application/json&srsname=EPSG:3857&bbox=${extent.join(",")},EPSG:3857`;

    const filterValue = document.getElementById("cqlFilter").value;
    if (filterValue) {
      url += `&CQL_FILTER=${encodeURIComponent(filterValue)}`;
    }
    return url;
  },
  strategy: ol.loadingstrategy.bbox,
});

const wfsLayer = new ol.layer.Vector({
  source: wfsSource,
  style: new ol.style.Style({
    stroke: new ol.style.Stroke({ color: "red", width: 2 }),
    fill: new ol.style.Fill({ color: "rgba(255, 0, 0, 0.1)" }),
  }),
  title: "WFS Layer",
});

// 4. Inisialisasi Peta
const map = new ol.Map({
  target: "map",
  layers: [new ol.layer.Tile({ source: new ol.source.OSM() }), wmsLayer, wfsLayer],
  view: new ol.View({
    center: ol.proj.fromLonLat([-98.5795, 39.8283]),
    zoom: 4,
  }),
});

// 5. Setup Popup
const container = document.getElementById("popup");
const content = document.getElementById("popup-content");
const closer = document.getElementById("popup-closer");

const overlay = new ol.Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: { duration: 250 },
});
map.addOverlay(overlay);

closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};

// 6. Logika Klik Peta
map.on("singleclick", function (evt) {
  let featureFound = false;

  // A. Interaksi WFS (Syarat Minimal)
  if (wfsLayer.getVisible()) {
    const feature = map.forEachFeatureAtPixel(evt.pixel, function (feat) {
      return feat;
    });
    if (feature) {
      featureFound = true;
      const stateName = feature.get("STATE_NAME");
      const persons = feature.get("PERSONS");

      content.innerHTML = `<strong>[WFS Data Klien]</strong><br>Negara Bagian: ${stateName}<br>Populasi: ${persons}`;
      overlay.setPosition(evt.coordinate);
    }
  }

  // B. Interaksi WMS GetFeatureInfo (Bonus)
  if (!featureFound && wmsLayer.getVisible()) {
    const viewResolution = map.getView().getResolution();
    const url = wmsSource.getFeatureInfoUrl(evt.coordinate, viewResolution, "EPSG:3857", { INFO_FORMAT: "application/json" });

    if (url) {
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          if (data.features && data.features.length > 0) {
            const props = data.features[0].properties;
            content.innerHTML = `<strong>[WMS GetFeatureInfo]</strong><br>Negara Bagian: ${props.STATE_NAME}<br>Pekerja: ${props.WORKERS}`;
            overlay.setPosition(evt.coordinate);
          } else {
            overlay.setPosition(undefined);
          }
        })
        .catch(() => {
          overlay.setPosition(undefined);
        });
    }
  } else if (!featureFound) {
    overlay.setPosition(undefined);
  }
});

// 7. Toggle Layer Visibility
document.getElementById("wmsToggle").addEventListener("change", function (e) {
  wmsLayer.setVisible(e.target.checked);
});
document.getElementById("wfsToggle").addEventListener("change", function (e) {
  wfsLayer.setVisible(e.target.checked);
});

// 8. CQL Filter Interaktif
document.getElementById("cqlFilter").addEventListener("change", function (e) {
  const filterValue = e.target.value;

  // 1. Update WMS (Gambar)
  if (filterValue) {
    wmsSource.updateParams({ CQL_FILTER: filterValue });
  } else {
    wmsSource.updateParams({ CQL_FILTER: undefined });
  }

  // 2. Update WFS (Vektor)
  wfsSource.clear();
});
