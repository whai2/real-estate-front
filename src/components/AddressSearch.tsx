import React, { useEffect, useRef, useCallback } from 'react';
import { Modal, StyleSheet, View, TouchableOpacity, Text, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZE, SPACING } from '../constants/theme';

export interface AddressResult {
  zonecode: string;
  address: string;
  addressDetail: string;
  sido: string;
  sigungu: string;
  bname: string;
  lat?: number;
  lng?: number;
}

interface Props {
  visible: boolean;
  onSelect: (result: AddressResult) => void;
  onClose: () => void;
}

const KAKAO_APP_KEY = '4168e59cf6a00ecceae599cf167101f1';

const POSTCODE_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    body { margin: 0; padding: 0; }
    #loading { display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(255,255,255,0.8); z-index:9999; justify-content:center; align-items:center; font-size:16px; color:#333; }
  </style>
</head>
<body>
  <div id="wrap" style="width:100%;height:100vh;"></div>
  <div id="loading">주소 좌표 변환 중...</div>
  <script src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
  <script>
    function sendResult(result) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(result));
      } else {
        window.parent.postMessage({ type: 'ADDRESS_SELECTED', result: result }, '*');
      }
    }

    function initPostcode(geocoder) {
      new daum.Postcode({
        oncomplete: function(data) {
          var address = data.roadAddress || data.jibunAddress;
          var result = {
            zonecode: data.zonecode,
            address: address,
            addressDetail: data.buildingName || '',
            sido: data.sido,
            sigungu: data.sigungu,
            bname: data.bname
          };

          if (geocoder) {
            document.getElementById('loading').style.display = 'flex';
            geocoder.addressSearch(address, function(coords, status) {
              document.getElementById('loading').style.display = 'none';
              if (status === kakao.maps.services.Status.OK && coords.length > 0) {
                result.lat = parseFloat(coords[0].y);
                result.lng = parseFloat(coords[0].x);
              }
              sendResult(result);
            });
          } else {
            sendResult(result);
          }
        },
        width: '100%',
        height: '100%'
      }).embed(document.getElementById('wrap'));
    }

    var kakaoScript = document.createElement('script');
    kakaoScript.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&libraries=services&autoload=false';
    kakaoScript.onload = function() {
      kakao.maps.load(function() {
        initPostcode(new kakao.maps.services.Geocoder());
      });
    };
    kakaoScript.onerror = function() {
      initPostcode(null);
    };
    document.head.appendChild(kakaoScript);
  </script>
</body>
</html>
`;

function WebAddressSearch({ onSelect, onClose }: Omit<Props, 'visible'>) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleMessage = useCallback((event: MessageEvent) => {
    if (event.data?.type === 'ADDRESS_SELECTED') {
      onSelect(event.data.result);
    }
  }, [onSelect]);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(POSTCODE_HTML);
        doc.close();
      }
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>주소 검색</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.close}>닫기</Text>
        </TouchableOpacity>
      </View>
      <iframe
        ref={iframeRef}
        style={{ flex: 1, border: 'none', width: '100%', height: '100%' } as any}
      />
    </View>
  );
}

function NativeAddressSearch({ onSelect, onClose }: Omit<Props, 'visible'>) {
  const { WebView } = require('react-native-webview');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>주소 검색</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.close}>닫기</Text>
        </TouchableOpacity>
      </View>
      <WebView
        source={{ html: POSTCODE_HTML }}
        onMessage={(event: any) => {
          const result: AddressResult = JSON.parse(event.nativeEvent.data);
          onSelect(result);
        }}
        style={styles.webview}
      />
    </SafeAreaView>
  );
}

export default function AddressSearch({ visible, onSelect, onClose }: Props) {
  if (!visible) return null;

  if (Platform.OS === 'web') {
    return (
      <Modal visible={visible} animationType="slide">
        <WebAddressSearch onSelect={onSelect} onClose={onClose} />
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <NativeAddressSearch onSelect={onSelect} onClose={onClose} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  close: {
    fontSize: FONT_SIZE.base,
    color: COLORS.primary,
    fontWeight: '600',
  },
  webview: {
    flex: 1,
  },
});
