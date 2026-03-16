// 카카오맵 JavaScript API Key (발급 후 교체 필요)
const KAKAO_APP_KEY = '4168e59cf6a00ecceae599cf167101f1';

export function getKakaoMapHtml(lat: number, lng: number) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
  <style>
    * { margin: 0; padding: 0; }
    html, body, #map { width: 100%; height: 100%; overflow: hidden; }

    .custom-marker {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0F766E;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      white-space: nowrap;
      position: relative;
      cursor: pointer;
    }
    .custom-marker::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid #0F766E;
    }

    .my-location-btn {
      position: absolute;
      bottom: 24px;
      right: 12px;
      z-index: 10;
      width: 44px;
      height: 44px;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="my-location-btn" onclick="moveToMyLocation()">📍</div>

  <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&libraries=services,clusterer&autoload=false"></script>
  <script>
    var map, clusterer, markers = [], overlays = [], ps;
    var currentLat = ${lat}, currentLng = ${lng};

    function initMap() {
      var container = document.getElementById('map');
      var options = {
        center: new kakao.maps.LatLng(currentLat, currentLng),
        level: 5
      };
      map = new kakao.maps.Map(container, options);
      ps = new kakao.maps.services.Places();

      // 클러스터러
      clusterer = new kakao.maps.MarkerClusterer({
        map: map,
        averageCenter: true,
        minLevel: 6,
        styles: [{
          width: '44px', height: '44px',
          background: 'rgba(15, 118, 110, 0.85)',
          borderRadius: '22px',
          color: '#fff',
          textAlign: 'center',
          lineHeight: '44px',
          fontSize: '14px',
          fontWeight: '700'
        }]
      });

      // 줌 레벨 변경 시 오버레이 표시/숨김
      kakao.maps.event.addListener(map, 'zoom_changed', function() {
        var level = map.getLevel();
        overlays.forEach(function(ov) {
          ov.setMap(level < 6 ? map : null);
        });
      });

      // 지도 이동 완료 시 RN에 영역 전달
      kakao.maps.event.addListener(map, 'idle', function() {
        var bounds = map.getBounds();
        var center = map.getCenter();
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'bounds_changed',
          data: {
            center: { lat: center.getLat(), lng: center.getLng() },
            sw: { lat: bounds.getSouthWest().getLat(), lng: bounds.getSouthWest().getLng() },
            ne: { lat: bounds.getNorthEast().getLat(), lng: bounds.getNorthEast().getLng() },
            level: map.getLevel()
          }
        }));
      });
    }

    // RN에서 마커 데이터 수신
    function setMarkers(properties) {
      // 기존 마커/오버레이 제거
      clusterer.clear();
      markers = [];
      overlays.forEach(function(ov) { ov.setMap(null); });
      overlays = [];

      var showOverlays = map.getLevel() < 6;

      properties.forEach(function(p) {
        var el = document.createElement('div');
        el.className = 'custom-marker';
        el.textContent = p.price;
        el.onclick = function() {
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'marker_click',
            data: p
          }));
        };

        var overlay = new kakao.maps.CustomOverlay({
          position: new kakao.maps.LatLng(p.lat, p.lng),
          content: el,
          yAnchor: 1.3,
          zIndex: 10
        });

        // 클러스터러용 투명 마커
        var marker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(p.lat, p.lng),
          opacity: 0
        });

        markers.push(marker);
        overlays.push(overlay);
        overlay.setMap(showOverlays ? map : null);
      });

      clusterer.addMarkers(markers);
    }

    // 장소 검색 (외부에서 keyword를 전달받아 실행)
    function searchPlace(keyword) {
      if (!keyword) return;

      ps.keywordSearch(keyword, function(data, status) {
        if (status === kakao.maps.services.Status.OK) {
          var bounds = new kakao.maps.LatLngBounds();
          data.forEach(function(item) {
            bounds.extend(new kakao.maps.LatLng(item.y, item.x));
          });
          map.setBounds(bounds);

          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'search_result',
            data: data.map(function(item) {
              return { name: item.place_name, address: item.address_name, lat: parseFloat(item.y), lng: parseFloat(item.x) };
            })
          }));
        }
      });
    }

    // 내 위치로 이동
    function moveToMyLocation() {
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'request_location'
      }));
    }

    // RN에서 위치 받아서 이동
    function moveTo(lat, lng, level) {
      var moveLatLng = new kakao.maps.LatLng(lat, lng);
      map.setCenter(moveLatLng);
      if (level) map.setLevel(level);
    }

    kakao.maps.load(initMap);
  </script>
</body>
</html>`;
}
