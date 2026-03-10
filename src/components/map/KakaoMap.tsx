import React, { useRef, useCallback, useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { getKakaoMapHtml } from './kakaoMapHtml';

export type MapProperty = {
  _id: string;
  title: string;
  address: string;
  price: string;
  lat: number;
  lng: number;
  type: string;
};

type MapEvent =
  | { type: 'bounds_changed'; data: { center: { lat: number; lng: number }; sw: { lat: number; lng: number }; ne: { lat: number; lng: number }; level: number } }
  | { type: 'marker_click'; data: MapProperty }
  | { type: 'search_result'; data: { name: string; address: string; lat: number; lng: number }[] }
  | { type: 'request_location' };

type Props = {
  initialLat?: number;
  initialLng?: number;
  onBoundsChange?: (bounds: any) => void;
  onMarkerClick?: (property: MapProperty) => void;
  onRequestLocation?: () => void;
};

type MapHandle = {
  setMarkers: (p: MapProperty[]) => void;
  moveTo: (lat: number, lng: number, level?: number) => void;
};

// ─── 웹 전용: iframe 기반 ───
const KakaoMapWebInner = React.forwardRef<MapHandle, Props>(function KakaoMapWebInner(props, ref) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const blobUrlRef = useRef<string | null>(null);
  const {
    initialLat = 37.5665,
    initialLng = 126.978,
    onBoundsChange,
    onMarkerClick,
    onRequestLocation,
  } = props;

  // postMessage를 parent.postMessage로 변경한 웹용 HTML 생성
  useEffect(() => {
    const html = getKakaoMapHtml(initialLat, initialLng).replace(
      /window\.ReactNativeWebView && window\.ReactNativeWebView\.postMessage/g,
      'window.parent.postMessage'
    );
    const blob = new Blob([html], { type: 'text/html' });
    blobUrlRef.current = URL.createObjectURL(blob);
    if (iframeRef.current) {
      iframeRef.current.src = blobUrlRef.current;
    }
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, [initialLat, initialLng]);

  // parent에서 iframe 메시지 수신
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      try {
        const msg: MapEvent =
          typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!msg.type) return;
        switch (msg.type) {
          case 'bounds_changed':
            onBoundsChange?.(msg);
            break;
          case 'marker_click':
            onMarkerClick?.(msg.data);
            break;
          case 'request_location':
            onRequestLocation?.();
            break;
        }
      } catch {}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onBoundsChange, onMarkerClick, onRequestLocation]);

  const setMarkers = useCallback((properties: MapProperty[]) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ action: 'setMarkers', data: properties }),
      '*'
    );
  }, []);

  const moveTo = useCallback((lat: number, lng: number, level?: number) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ action: 'moveTo', data: { lat, lng, level } }),
      '*'
    );
  }, []);

  React.useImperativeHandle(ref, () => ({ setMarkers, moveTo }), [setMarkers, moveTo]);

  const onLoad = () => {
    const iframeWin = iframeRef.current?.contentWindow;
    if (!iframeWin) return;
    // iframe 내부에 parent → iframe 메시지 리스너 주입
    const script = iframeWin.document.createElement('script');
    script.textContent = `
      window.addEventListener('message', function(e) {
        try {
          var msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
          if (msg.action === 'setMarkers' && typeof setMarkers === 'function') {
            setMarkers(msg.data);
          } else if (msg.action === 'moveTo' && typeof moveTo === 'function') {
            moveTo(msg.data.lat, msg.data.lng, msg.data.level);
          }
        } catch(err) {}
      });
    `;
    iframeWin.document.body.appendChild(script);
  };

  return (
    <View style={styles.webview}>
      <iframe
        ref={iframeRef}
        onLoad={onLoad}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
      />
    </View>
  );
});

// ─── 네이티브 전용: WebView 기반 ───
const KakaoMapNativeInner = React.forwardRef<MapHandle, Props>(function KakaoMapNativeInner(props, ref) {
  const { WebView } = require('react-native-webview');
  const webViewRef = useRef<any>(null);
  const {
    initialLat = 37.5665,
    initialLng = 126.978,
    onBoundsChange,
    onMarkerClick,
    onRequestLocation,
  } = props;

  const setMarkers = useCallback((properties: MapProperty[]) => {
    const js = `setMarkers(${JSON.stringify(properties)}); true;`;
    webViewRef.current?.injectJavaScript(js);
  }, []);

  const moveTo = useCallback((lat: number, lng: number, level?: number) => {
    const js = `moveTo(${lat}, ${lng}, ${level || 'null'}); true;`;
    webViewRef.current?.injectJavaScript(js);
  }, []);

  React.useImperativeHandle(ref, () => ({ setMarkers, moveTo }), [setMarkers, moveTo]);

  const handleMessage = useCallback(
    (event: any) => {
      try {
        const msg: MapEvent = JSON.parse(event.nativeEvent.data);
        switch (msg.type) {
          case 'bounds_changed':
            onBoundsChange?.(msg);
            break;
          case 'marker_click':
            onMarkerClick?.(msg.data);
            break;
          case 'request_location':
            onRequestLocation?.();
            break;
        }
      } catch {}
    },
    [onBoundsChange, onMarkerClick, onRequestLocation]
  );

  return (
    <WebView
      ref={webViewRef}
      source={{ html: getKakaoMapHtml(initialLat, initialLng) }}
      style={styles.webview}
      onMessage={handleMessage}
      javaScriptEnabled
      domStorageEnabled
      originWhitelist={['*']}
      scrollEnabled={false}
      bounces={false}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
    />
  );
});

// ─── 기본 export ───
export default function KakaoMap(props: Props) {
  if (Platform.OS === 'web') {
    return <KakaoMapWebInner {...props} />;
  }
  return <KakaoMapNativeInner {...props} />;
}

// ─── forwardRef export (map.tsx에서 사용) ───
export const KakaoMapWithRef = React.forwardRef<MapHandle, Props>(
  function KakaoMapWithRef(props, ref) {
    if (Platform.OS === 'web') {
      return <KakaoMapWebInner {...props} ref={ref} />;
    }
    return <KakaoMapNativeInner {...props} ref={ref} />;
  }
);

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
});
