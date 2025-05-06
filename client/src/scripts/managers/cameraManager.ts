import { Layer } from "@common/constants";
import { DEFAULT_SCOPE, Scopes } from "@common/definitions/items/scopes";
import { EaseFunctions, Numeric } from "@common/utils/math";
import { removeFrom } from "@common/utils/misc";
import { randomPointInsideCircle } from "@common/utils/random";
import { Vec, type Vector } from "@common/utils/vector";
import { ShockwaveFilter } from "pixi-filters";
import { Container, Filter } from "pixi.js";
import { GameConsole } from "../console/gameConsole";
import { Game } from "../game";
import { PIXI_SCALE } from "../utils/constants";
import { SuroiSprite } from "../utils/pixi";
import { type Tween } from "../utils/tween";

class CameraManagerClass {
    readonly container = new Container();

    protected _layerIndices: number[] = [];
    protected _layers: Record<number, Container> = {};

    position = Vec.create(0, 0);

    private _zoom = DEFAULT_SCOPE.zoomLevel;
    get zoom(): number { return this._zoom; }
    set zoom(zoom: number) {
        this._zoom = zoom;
        this.resize(true);
    }

    zoomTween?: Tween<Vector>;

    shaking = false;
    shakeStart!: number;
    shakeDuration!: number;
    shakeIntensity!: number;

    readonly shockwaves = new Set<Shockwave>();

    width = 1;
    height = 1;

    private _initialized = false;
    init(): void {
        if (this._initialized) {
            throw new Error("CameraManager has already been initialized");
        }
        this._initialized = true;
        this.container.label = "CameraManager";
    }

    resize(animation = false): void {
        this.width = Game.pixi.screen.width;
        this.height = Game.pixi.screen.height;

        const minDimension = Numeric.min(this.width, this.height);
        const maxDimension = Numeric.max(this.width, this.height);
        const maxScreenDim = Numeric.max(minDimension * (16 / 9), maxDimension);
        const scale = (maxScreenDim * 0.5) / (this._zoom * PIXI_SCALE);

        this.zoomTween?.kill();

        if (animation) {
            this.zoomTween = Game.addTween(
                {
                    target: this.container.scale,
                    to: { x: scale, y: scale },
                    duration: 1250,
                    ease: EaseFunctions.cubicOut,
                    onComplete: () => {
                        this.zoomTween = undefined;
                    }
                }
            );
        } else {
            this.container.scale.set(scale);
        }
    }

    update(): void {
        let position = this.position;

        if (this.shaking) {
            position = Vec.add(position, randomPointInsideCircle(Vec.create(0, 0), this.shakeIntensity));
            if (Date.now() - this.shakeStart > this.shakeDuration) this.shaking = false;
        }

        for (const shockwave of this.shockwaves) {
            shockwave.update();
        }

        const cameraPos = Vec.add(
            Vec.scale(position, this.container.scale.x),
            Vec.create(-this.width / 2, -this.height / 2)
        );

        this.container.position.set(-cameraPos.x, -cameraPos.y);
    }

    shake(duration: number, intensity: number): void {
        if (!GameConsole.getBuiltInCVar("cv_camera_shake_fx")) return;
        this.shaking = true;
        this.shakeStart = Date.now();
        this.shakeDuration = duration;
        this.shakeIntensity = intensity;
    }

    shockwave(duration: number, position: Vector, amplitude: number, wavelength: number, speed: number, layer: Layer): void {
        if (!GameConsole.getBuiltInCVar("cv_cooler_graphics")) return;
        this.shockwaves.add(new Shockwave(duration, position, amplitude, wavelength, speed, layer));
    }

    addObject(...objects: Container[]): void {
        this.container.addChild(...objects);
    }

    getLayer(layer: number): Container {
        let renderLayer = this._layers[layer];
        if (renderLayer === undefined) {
            renderLayer = new Container({ sortableChildren: true });
            this._layers[layer] = renderLayer;
            this._layerIndices.push(layer);

            renderLayer.zIndex = layer;
            renderLayer.label = `Layer ${layer}`;
            this.container.addChild(renderLayer);
        }

        return renderLayer;
    }

    getOptionalLayer(layer: number): Container | undefined {
        return this._layers[layer];
    }

    layers(): Array<readonly [number, Container]> {
        return Object.entries(this._layers).map(([s, l]) => [+s, l] as const).sort(([a], [b]) => a - b);
    }

    addFilter(filter: Filter): void {
        (this.container.filters as Filter[]).push(filter);
    }

    removeFilter(filter: Filter): void {
        removeFrom(this.container.filters as Filter[], filter);
    }

    reset(): void {
        for (const container of this.container.removeChildren()) {
            container.removeChildren();
        }

        for (const key in this._layers) {
            this._layers[key].destroy();
        }
        this._layers = {};
        this._layerIndices.length = 0;
        this._layerIndices = [];

        this.zoom = Scopes.definitions[0].zoomLevel;
    }
}

export const CameraManager = new CameraManagerClass();

export class Shockwave {
    lifeStart: number;
    lifeEnd: number;
    filter: ShockwaveFilter;
    anchorContainer: SuroiSprite;

    constructor(
        lifetime: number,
        position: Vector,
        public amplitude: number,
        public wavelength: number,
        public speed: number,
        public layer: Layer
    ) {
        this.lifeStart = Date.now();
        this.lifeEnd = this.lifeStart + lifetime;
        this.anchorContainer = new SuroiSprite();
        this.wavelength = wavelength;

        CameraManager.container.addChild(this.anchorContainer);
        this.anchorContainer.setVPos(position);

        this.filter = new ShockwaveFilter();

        this.update();

        CameraManager.addFilter(this.filter);
    }

    update(): void {
        const now = Date.now();
        if (now > this.lifeEnd) {
            this.destroy();
            return;
        }

        const scale = this.scale();

        const position = this.anchorContainer.getGlobalPosition();

        this.filter.centerX = position.x;
        this.filter.centerY = position.y;

        this.filter.wavelength = this.wavelength * scale;
        this.filter.speed = this.speed * scale;
        this.filter.time = now - this.lifeStart;
        this.filter.amplitude = this.amplitude * EaseFunctions.linear(1 - ((now - this.lifeStart) / (this.lifeEnd - this.lifeStart)));
    }

    scale(): number {
        return PIXI_SCALE / CameraManager.zoom;
    }

    destroy(): void {
        CameraManager.removeFilter(this.filter);
        CameraManager.shockwaves.delete(this);
        this.anchorContainer.destroy();
    }
}
