import { Runtime } from "trident";
import { Camera, Component, GameObject, Transform } from "trident/dist/esm/components";
import { HideFlags } from "trident/dist/esm/enums/HideFlags";
import { Object3DExtended } from "trident/dist/esm/utils/Object3DExtended";
import { Raycaster, Vector2, Vector3, GridHelper } from 'trident/node_modules/three';

import { OrbitControls } from 'trident/node_modules/three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'trident/node_modules/three/examples/jsm/controls/TransformControls';

export class SceneControls extends Component {
    public OnTransformSelected: (transform: Transform) => void = () => {};
    public OnTransformUpdated: (transform: Transform) => void = () => {};

    private sceneCamera: Camera;
    private orbitControls: OrbitControls;
    private transformControls: TransformControls;
    private raycaster: Raycaster;
    private gridHelper: GridHelper;

    constructor(gameObject: GameObject, transform: Transform) {
        super(gameObject, transform);

        this.gameObject.hideFlags = HideFlags.HideAndDontSave;
        this.gameObject.name = "SceneControls";
        this.sceneCamera = this.gameObject.AddComponent(Camera);
        this.gameObject.scene.SetActiveCamera(this.sceneCamera);

        this.orbitControls = new OrbitControls(this.sceneCamera.GetCamera(), Runtime.Renderer.renderer.domElement);
        this.orbitControls.minDistance = 5;
        this.orbitControls.update();

        this.transformControls = new TransformControls(this.sceneCamera.GetCamera(), Runtime.Renderer.renderer.domElement);
        this.transformControls.space = "local";
        this.transformControls.addEventListener( 'dragging-changed', (event) => {
            this.orbitControls.enabled = ! event.value;
        });

        this.transformControls.addEventListener( 'change', (event) => {
            if (this.transformControls.object) {
                const transform = this.transformControls.object.userData as Transform;
                this.OnTransformUpdated(transform);
            }
        });
        this.transform.group.add(this.transformControls);

        Runtime.Renderer.renderer.domElement.addEventListener( 'pointerdown', (event: PointerEvent) => {this.onPointerDown(event)});


        this.gridHelper = new GridHelper(1000, 1000, 0x404040, 0x404040 );
        this.transform.group.add( this.gridHelper );

        this.raycaster = new Raycaster();
    }

    private onPointerDown(event: PointerEvent) {
        if (this.transformControls.axis != null) return;

        const w = Runtime.Renderer.renderer.domElement.offsetWidth;
        const h = Runtime.Renderer.renderer.domElement.offsetHeight;

        let pointer = new Vector2();
        pointer.x = ( event.offsetX / w ) * 2 - 1;
        pointer.y = - ( event.offsetY / h ) * 2 + 1;

        this.raycaster.setFromCamera( pointer, this.gameObject.scene.GetActiveCamera().GetCamera() );

        let objects: Object3DExtended[] = [];

        this.gameObject.scene.rendererScene.traverse((obj) => {
            if (obj instanceof Object3DExtended && obj !== this.transform.group) {
                objects.push(obj);
            }

        })
        
        const intersects = this.raycaster.intersectObjects( objects, true );

        if (intersects.length > 0) {
            const mesh = intersects[0].object;
            if (mesh.parent && mesh.parent) {
                const transform = mesh.parent.userData as Transform;
                this.OnTransformSelected(transform);
            }
        }
    }

    public SetEnabled(enabled: boolean) {
        this.transform.group.visible = enabled;
        this.orbitControls.enabled = enabled;
    }

    public GetOrbitControlsPosition(): Vector3 {
        return this.sceneCamera.GetCamera().position;
    }

    public SetOrbitControlsPosition(position: Vector3) {
        this.sceneCamera.GetCamera().position.copy(position);
        this.orbitControls.update();
    }

    public ChangeTransformControlsMode(mode: "translate" | "rotate" | "scale") {
        this.transformControls.mode = mode;
    }

    public DetachTransformControls() {
        this.transformControls.detach();
    }

    public AttachTransformControls(transform: Transform) {
        this.DetachTransformControls();
        this.transformControls.attach(transform.group);
    }
}