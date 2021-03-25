import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';

import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose'
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';

import Canvas from 'react-native-canvas';



export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);

  const [isTfReady, setIsTfReady] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [model, setModel] = useState(null);
  const [predictions, setPredictions] = useState(false);
  const [image, setImage] = useState(false);

  const TensorCamera = cameraWithTensors(Camera);


  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      await tf.ready();
      setIsTfReady(true);
      console.log("텐서플로우레디")
      const model = await handpose.load();
      setIsModelReady(true);
      console.log("핸드모델 레디")
      setModel(model);
      tf.device_util.isMobile = () => true
      tf.device_util.isBrowser = () => false
    })();
  }, []);

  handleCameraStream = (images) => {
    const loop = async () => {
      const nextImageTensor = images.next().value
      //console.log("nextImageTensor:", nextImageTensor);

      //
      // do something with tensor here
      //this.model = await handpose.load(); 
      if (nextImageTensor) {
        //console.log("모델로 분석하기 단계 돌입")
        const predictions = await model.estimateHands(nextImageTensor);
        //console.log("작업물 가지고 작업하기 돌입")
        if (predictions.length>0){
          console.log("predictions:", predictions);
        }
      }
      //requestAnimationFrame(loop); 이거 있으면 카메라 존나 버벅거림. 무슨 역할이지
    }
    loop();
  }

  handleCanvas = (canvas) => {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'purple';
    ctx.fillRect(0, 0, 100, 100);
  }

  const inputTensorWidth = 152;
  const inputTensorHeight = 200;
  const AUTORENDER = true;

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  //<Camera style={styles.camera} type={type}/>
  return (
    <View style={styles.container}>
      
      <TensorCamera
          // Standard Camera props
          style={styles.camera}
          type={Camera.Constants.Type.back}
          zoom={0}
          // tensor related props
          cameraTextureHeight={1200}
          cameraTextureWidth={1600}
          resizeHeight={inputTensorHeight}
          resizeWidth={inputTensorWidth}
          resizeDepth={3}
          onReady={(images, updatePreview, gl) =>
            handleCameraStream(images)}
          autorender={AUTORENDER}
        />
        <Canvas style={styles.camera} ref={this.handleCanvas}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
});
