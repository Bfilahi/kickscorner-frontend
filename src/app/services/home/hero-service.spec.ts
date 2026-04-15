import { TestBed } from '@angular/core/testing';
import 'zone.js';

import { HeroService } from './hero-service';


describe('HeroService', () => {
  let service: HeroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize GLTFLoader', () => {
    expect(service['gltfLoader']).toBeTruthy();
  });

  describe('createScene()', () => {
    it('should create scene and camera', () => {
      const canvas = document.createElement('canvas');

      service.createScene({nativeElement: canvas});

      expect(service['scene']).toBeTruthy();
      expect(service['camera']).toBeTruthy();
      expect(service['renderer']).toBeTruthy();
      expect(service['renderer'].shadowMap.enabled).toBeTrue();
    });
  });

});
