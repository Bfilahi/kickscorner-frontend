import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
// import 'zone.js';
import 'zone.js/testing';

import { Hero } from './hero';
import { HeroService } from '../../../services/home/hero-service';
import { PLATFORM_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import gsap from 'gsap';


describe('Hero', () => {
  let component: Hero;
  let fixture: ComponentFixture<Hero>;

  let mockHeroService: jasmine.SpyObj<HeroService>;

  beforeEach(async () => {
    mockHeroService = jasmine.createSpyObj([
      'createScene',
      'animate',
      'cleanup',
    ]);

    await TestBed.configureTestingModule({
      imports: [Hero],
      providers: [
        provideRouter([]),
        {provide: HeroService, useValue: mockHeroService},
        // {provide: PLATFORM_ID, useValue: 'server'}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Hero);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should call initializeScene only when running in a browser', fakeAsync(() => {
      spyOn<any>(component, 'initializeScene');

      fixture.detectChanges();

      tick(1000);
      expect(component['initializeScene']).toHaveBeenCalled();
    }));

    it('should make initializeScene call heroService.createScene and heroService.animate with the canvas reference', () => {
      const canvas = fixture.debugElement.query(By.css('canvas'));
      component.canvas = canvas;
      mockHeroService.createScene.and.returnValue(void 0);
      mockHeroService.animate.and.returnValue(void 0);

      component['initializeScene']();

      expect(mockHeroService.createScene).toHaveBeenCalled();
      expect(mockHeroService.animate).toHaveBeenCalled();
    });

    it('should make initializeScene call animateTitle', () => {
      const canvas = fixture.debugElement.query(By.css('canvas'));
      component.canvas = canvas;
      spyOn<any>(component, 'animateTitle');

      component['initializeScene']();

      expect(component['animateTitle']).toHaveBeenCalled();
    });
  });

  describe('animateTitle()', () => {
    it('should pass the title elements to gsap.from with the correct animation config', () => {
      const titleElems = component.title.nativeElement.querySelectorAll('.title');
      const animationConfig = {
        opacity: 0,
        y: 50,
        duration: 1,
        stagger: 0.2,
        ease: "back.out(1.7)",
        delay: 1
      };
      spyOn(gsap, 'from');

      component['animateTitle']();

      expect((gsap as any).from).toHaveBeenCalledWith(titleElems, animationConfig);
    });
  });

  describe('scrollToHero2()', () => {
    it('should call scrollIntoView with { behavior: \'smooth\' } on hero2.nativeElement', () => {
      spyOn(component.hero2.nativeElement, 'scrollIntoView');

      component.scrollToHero2();

      expect(component.hero2.nativeElement.scrollIntoView).toHaveBeenCalledWith(
        { behavior: 'smooth' },
      );
    });
  });

  describe('ngOnDestroy()', () => {
    it('should call heroService.cleanup when in a browser environment', () => {
      mockHeroService.cleanup.and.returnValue(void 0);

      component.ngOnDestroy();

      expect(mockHeroService.cleanup).toHaveBeenCalled();
    });
  });
});

describe('non-browser environment', () => {
  let component: Hero;
  let fixture: ComponentFixture<Hero>; 

  let mockHeroService: jasmine.SpyObj<HeroService>;

  beforeEach(() => {
    mockHeroService = jasmine.createSpyObj([
      'createScene',
      'animate',
      'cleanup',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });

    fixture = TestBed.createComponent(Hero);
    component = fixture.componentInstance;
  });

  it('should not call heroService.cleanup during SSR', () => {
    mockHeroService.cleanup.and.returnValue(void 0);

    component.ngOnDestroy();

    expect(mockHeroService.cleanup).not.toHaveBeenCalled();
  });

})