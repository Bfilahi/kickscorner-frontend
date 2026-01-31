import { ElementRef, Injectable } from '@angular/core';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Injectable({
  providedIn: 'root'
})
export class HeroService {

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private directionalLight!: THREE.DirectionalLight;
  private planeGeometry!: THREE.PlaneGeometry;
  private planeMaterial!: THREE.ShadowMaterial;

  private model!: THREE.Object3D;
  private gltfLoader!: GLTFLoader;

  private PI = Math.PI;
  private floatAmplitude = .1;
  private floatSpeed = 1.5;


  public constructor(){
    this.gltfLoader = new GLTFLoader();
    gsap.registerPlugin(ScrollTrigger);
  }
  

  public createScene(canvas: ElementRef<HTMLCanvasElement>){

    // Scene
    this.scene = new THREE.Scene();

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas.nativeElement,
      antialias: true,
      alpha: true
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      40, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      100
    );

    this.camera.position.z = 5;
    this.scene.add(this.camera);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(5, 5, 5);
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 500;
    this.directionalLight.shadow.camera.left = -10;
    this.directionalLight.shadow.camera.right = 10;
    this.directionalLight.shadow.camera.top = 10;
    this.directionalLight.shadow.camera.bottom = -10;
    this.directionalLight.shadow.mapSize.set(1024, 1024);
    this.directionalLight.castShadow = true;
    this.scene.add(this.directionalLight);

    // Floor
    this.planeGeometry = new THREE.PlaneGeometry(20, 20);
    this.planeMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
    const floor = new THREE.Mesh(this.planeGeometry, this.planeMaterial);

    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Load 3d model
    this.loadModel();
  }

  private loadModel(){
    this.gltfLoader.load('/models/shoe.glb', (gltf) =>{
      this.model = gltf.scene;

      this.model.traverse((node) => {
        if ((node as THREE.Mesh).isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });

      this.model.scale.set(.4, .4, .4);
      this.model.position.set(5, 0, 0);
      this.model.rotation.y = 0;

      this.scene.add(this.model);

      this.playInitialAnimation();
      this.setupScrollTrigger();

    });
  }

  private playInitialAnimation(){
    let tl = gsap.timeline({
      defaults: {
        duration: 1.5,
        ease: 'elastic.out(.7, .3)'
      }
    });

    tl
      .to(this.model.position, {x: 0})
      .to(this.model.rotation, {y: this.PI * 2}, '-=1');
  }


  public setupScrollTrigger(){
    ScrollTrigger.create({
      trigger: '#hero-1',
      start: 'top top',
      end: 'bottom top',
      scrub: .1,
      onUpdate: (self) => {
        if (this.model) {
          // Rotate based on scroll progress (0 to 1)
          const rotation = self.progress * this.PI * 2;
          this.model.rotation.x = rotation;
        }
      }
    });

    ScrollTrigger.create({
      trigger: '#hero-2',
      start: 'top top',
      end: `${window.innerHeight}px`,
      pin: true,
      pinSpacing: false,
    })
  }

  public animate(){
    this.tick();

    window.addEventListener('resize', () => {
      this.onResize();
    });
  }

  private onResize(){
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  private tick(){
    if(this.scene && this.camera && this.renderer)
      this.renderer.render(this.scene, this.camera);

    if(this.model){
        const floatOffset = Math.sin(Date.now() * .001 * this.floatSpeed) * this.floatAmplitude;
        this.model.position.y = floatOffset;
    }

    window.requestAnimationFrame(() => this.tick());
  }

  public cleanup() {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());

    if (this.renderer) {
      this.renderer.dispose();
    }
    
    if (this.scene) {
      this.scene.clear();
    }
  }
}
