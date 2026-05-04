import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Home } from './home';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HeroService } from '../../services/home/hero-service';
import { ProductService } from '../../services/product-service';
import { NEVER } from 'rxjs';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  let mockHeroService: jasmine.SpyObj<HeroService>;
  let mockProductService: jasmine.SpyObj<ProductService>;


  beforeEach(async () => {
    mockHeroService = jasmine.createSpyObj([
      'createScene',
      'animate',
      'cleanup',
    ]);
    mockProductService = jasmine.createSpyObj(['getProducts']);

    mockProductService.getProducts.and.returnValue(NEVER);
    mockHeroService.createScene.and.returnValue(void 0);
    mockHeroService.animate.and.returnValue(void 0);

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        { provide: HeroService, useValue: mockHeroService },
        { provide: ProductService, useValue: mockProductService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
