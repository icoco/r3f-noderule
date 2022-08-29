import { useState } from 'react'
import { Canvas,useFrame } from '@react-three/fiber'
import {OrbitControls}  from '@react-three/drei'
import {  TransformControls, useCursor } from '@react-three/drei'
import { useControls } from 'leva'
import create from 'zustand'

import './App.css';
import * as THREE from 'three';
///import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
//import { Canvas,useFrame, extend,  useThree} from 'react-three-fiber';
import {  useLoader,tubeGeometry   } from 'react-three-fiber';
import circleImg from './assets/circle.png';
import { Suspense, useCallback, useMemo, useRef } from 'react';
//extend({OrbitControls})



const useStore = create((set) => ({ target: null, setTarget: (target) => set({ target }) }))

function Box(props) {
  const setTarget = useStore((state) => state.setTarget)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  return (
    <mesh {...props} onClick={(e) => setTarget(e.object)} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <boxGeometry />
      <meshNormalMaterial />
    </mesh>
  )
}

 

// function CameraControls(){
//   const {
//     camera,
//     gl: {domElement}
//   } = useThree();

//   const controlsRef = useRef();
//   useFrame(() => controlsRef.current.update())

//   return (
//     <orbitControls
//       ref={controlsRef}
//       args={[camera, domElement]}
//       autoRotate
//       autoRotateSpeed={-0.2}
//     />
//   );
// }

function Points() {
  const imgTex = useLoader(THREE.TextureLoader, circleImg);
  const bufferRef = useRef();

  let t = 0;
  let f = 0.002;
  let a = 3;
  const graph = useCallback((x, z) => {
    return Math.sin(f * (x ** 2 + z ** 2 + t)) * a;
  }, [t, f, a])

  const count = 100
  const sep =  1 //@3
  let positions = useMemo(() => {
    let positions = []

    for (let xi = 0; xi < count; xi++) {
      for (let zi = 0; zi < count; zi++) {
          let x = sep * (xi - count / 2);
          let z = sep * (zi - count / 2);
       

        let y = graph(x, z);
        positions.push(x, y, z);
      }
    }

    return new Float32Array(positions);
  }, [count, sep, graph])

  useFrame(() => {
    if (1>0){
      return 
    }
    t += 15
    
    const positions = bufferRef.current.array;

    let i = 0;
    for (let xi = 0; xi < count; xi++) {
      for (let zi = 0; zi < count; zi++) {
        let x = sep * (xi - count / 2);
        let z = sep * (zi - count / 2);

        positions[i + 1] = graph(x, z);
        i += 3;
      }
    }

    bufferRef.current.needsUpdate = true;
  })

  return (
    <points>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          ref={bufferRef}
          attachObject={['attributes', 'position']}
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
        attach="material"
        map={imgTex}
        color={0x00AAFF}
        size={0.5}
        sizeAttenuation
        transparent={false}
        alphaTest={0.5}
        opacity={1.0}
      />
    </points>
  );
}

function NodeTree(args) {
  console.log('NodeTree args',args)
 
  var nodes = []
  nodes.push({x:20,y:10,z:10})
  nodes.push({x:10,y:10,z:15})

    let positions = []

    let count = 0 
    if (nodes){
      count = nodes.length
    } 
    for (let xi = 0; xi < count; xi++) {
        let node = nodes[xi]
        let x = node.x 
        let y = node.y 
        let z = node.z 
        positions.push(x, y, z);
      }
    
 
  return (
    <boxs>
      {/* {nodes.map((item) =>
            <Box  position={[item.x, item.y, item.z]} />
        )}  */}
    </boxs>
  );
}

// render nodes 
function Nodes(args) {
  const target = args.target
  const mode = args.mode
  const curve = args.curve
  console.log('args',args)
  return (
    <mesh   >
      <NodeTree args={{nodes:args.nodes}}  />
     {/* <Box color="red"  args={[20, 10, 10]}/>
        <Box position={[20, 10, 10]} />
        <Box /> */}
          {target && <TransformControls object={target} mode={mode} />}

        <tubeGeometry
        path={curve}
        tubularSegments={70}
        radius={0.02}
        radialSegments={50}
        closed={true} /> 
    </mesh>
  )
}

function AnimationCanvas(args) {
  const { target, setTarget } = useStore()
  const { mode } = useControls({ mode: { value: 'translate', options: ['translate', 'rotate', 'scale'] } })  
  var nodes = []
  nodes.push({x:20,y:10,z:10})
  nodes.push({x:10,y:10,z:15}) 
  nodes.push({x:10,y:15,z:15}) 

   // Create a curve based on the points
   const [curve] = useState(() => {
    // Create an empty array to stores the points
    let points = []
    // Define points along Z axis
    for (let i = 0; i < 50; i += 1)
      points.push(new THREE.Vector3(1 - Math.random() * 20, 1 - Math.random() * 20, 100 * (i / 4)))
    return new THREE.CatmullRomCurve3(points)
    }) 
  return (
    <Canvas
      colorManagement={false}
      camera={{ position: [100, 10, 0], fov: 75 }}
      onPointerMissed={() => setTarget(null)}
    >
      <Suspense fallback={null}>
        <Points />
      </Suspense>
       <mesh> 
       {/* <Nodes args={{ target:target,mode:mode,curve:curve}}  />  */}
       
       {nodes.map((item) =>
            <Box  position={[item.x, item.y, item.z]} />
        )} 

       {target && <TransformControls object={target} mode={mode} />}
      <meshNormalMaterial />
       </mesh>   
       
      {/* <CameraControls/> */}
      <OrbitControls makeDefault />
    </Canvas>
  );
}
 

function App() {
  
 
  return (
    <div className="anim">
      <Suspense fallback={<div>Loading...</div>}>
        <AnimationCanvas  />
      </Suspense>
    </div>
  );
}

export default App;
