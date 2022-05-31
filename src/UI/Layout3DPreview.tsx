import React, { createRef } from 'react';
import { 
    DirectionalLight, 
    Color, 
    MeshStandardMaterial, 
    BufferGeometry, 
    Scene, 
    PerspectiveCamera, 
    WebGLRenderer, 
    Mesh, 
    SphereGeometry, 
    AmbientLight,
    MathUtils
} from 'trident/node_modules/three';
import { TrackballControls } from 'trident/node_modules/three/examples/jsm/controls/TrackballControls';

interface Layout3DPreviewProps {
    instance: BufferGeometry | MeshStandardMaterial;
};

interface Layout3DPreviewState {
    instance: BufferGeometry | MeshStandardMaterial;
    renderer: WebGLRenderer;
    scene: Scene;
    camera: PerspectiveCamera;
    trackballControls: TrackballControls;
    mesh: Mesh;
};

export class Layout3DPreview extends React.Component<Layout3DPreviewProps, Layout3DPreviewState> {
    private canvasRef = createRef<HTMLCanvasElement>();

    constructor(props) {
        super(props);

        this.state = {
            instance: this.props.instance,
            renderer: null,
            scene: null,
            camera: null,
            trackballControls: null,
            mesh: null
        };
    }

    public componentDidMount() {
        this.SetupScene();
    }

    public componentDidUpdate() {
        if (!this.state.renderer) {
            this.SetupScene();
        }

        if (this.props.instance !== this.state.instance) {
            this.SetupScene();
        }
    }

    private UpdateCameraMeshDistance(mesh: Mesh, camera: PerspectiveCamera) {
        mesh.geometry.computeBoundingSphere();
        camera.position.z = -mesh.geometry.boundingSphere.radius*2;
    }

    private SetupScene() {
        if (this.state.renderer) {
            this.state.scene.clear();
            this.state.renderer.dispose();
        }

        const canvas = this.canvasRef.current;
        const w = this.canvasRef.current.parentElement.offsetWidth;
        const h = this.canvasRef.current.parentElement.offsetHeight;

        const renderer = new WebGLRenderer({canvas: canvas, antialias: true});
        renderer.setSize(w, h);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        
        const scene = new Scene();
        scene.background = new Color("#222222");
        const camera = new PerspectiveCamera( 60, w / h, 0.1, 1000 );
        camera.position.z = 2;
        
        const geometry = this.props.instance instanceof BufferGeometry ? this.props.instance : new SphereGeometry(1, 32, 32);
        const material = this.props.instance instanceof MeshStandardMaterial ? this.props.instance : new MeshStandardMaterial();
        const mesh = new Mesh( geometry, material );
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.geometry.computeBoundingSphere();
        mesh.position.sub(mesh.geometry.boundingSphere.center);
        camera.position.z = -mesh.geometry.boundingSphere.radius*2;
        scene.add( mesh );
        this.UpdateCameraMeshDistance(mesh, camera);
        
        const trackballControls = new TrackballControls(camera, renderer.domElement);
        trackballControls.noPan = true;
        trackballControls.noZoom = true;
        trackballControls.rotateSpeed = 2;
        trackballControls.staticMoving = true;
        trackballControls.update();

        const ambientLight = new AmbientLight(0xffffff, 0.3);
        scene.add(ambientLight);

        const directionalLight = new DirectionalLight();
        directionalLight.intensity = 0.5;
        directionalLight.position.set(0, 6, 0);
        directionalLight.rotation.set(50 * MathUtils.DEG2RAD, 30 * MathUtils.DEG2RAD, 0);
        scene.add(directionalLight);

        this.animate();

        new ResizeObserver(() => {
            this.OnResize()
        }).observe(renderer.domElement.parentElement);

        this.setState({
            instance: this.props.instance,
            renderer: renderer,
            scene: scene,
            camera: camera,
            trackballControls: trackballControls,
            mesh: mesh
        })
    }

    private animate() {
        requestAnimationFrame( () => {this.animate()} );

        if (this.state.trackballControls) {
            this.state.trackballControls.update();
        }
    
        if (this.state.renderer && this.state.scene && this.state.camera) {
            this.state.renderer.render( this.state.scene, this.state.camera );
        }
    }

    private OnResize() {
        if (this.canvasRef.current && this.state.renderer && this.state.scene && this.state.camera) {
            const w = this.canvasRef.current.parentElement.offsetWidth;
            const h = this.canvasRef.current.parentElement.offsetHeight;

            this.state.trackballControls.handleResize();

            this.state.camera.aspect = w / h;
            this.state.camera.updateProjectionMatrix();
            this.state.renderer.setSize(w, h);
        }
    }

    public render() {
        return (
            <div
                style={{
                    width: "100%",
                    marginTop: "20px"
                }}
            >
                <canvas ref={this.canvasRef}></canvas>
            </div>
        )
    }
}