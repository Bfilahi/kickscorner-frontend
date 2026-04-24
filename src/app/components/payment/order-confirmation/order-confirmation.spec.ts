import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'zone.js';

import { OrderConfirmation } from './order-confirmation';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('OrderConfirmation', () => {
  let component: OrderConfirmation;
  let fixture: ComponentFixture<OrderConfirmation>;

  let route: ActivatedRoute;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderConfirmation],
      providers: [
        provideRouter([])
      ]
    })
    .compileComponents();

    route = TestBed.inject(ActivatedRoute);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(OrderConfirmation);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should read sessionId correctly from the session_id query param on init', () => {
      spyOn(route.snapshot.queryParamMap, 'get').and.returnValue('mock-sessionId');

      fixture.detectChanges();

      expect(component.sessionId).toBe('mock-sessionId');
    });

    it('should keep sessionId null when no query param is present', () => {
      spyOn(route.snapshot.queryParamMap, 'get').and.returnValue(null);

      fixture.detectChanges();

      expect(component.sessionId).toBeNull();
    });
  });

  describe('template', () => {
    it('should render the session ID block when sessionId is truthy', () => {
      spyOn(route.snapshot.queryParamMap, 'get').and.returnValue('mock-sessionId');

      fixture.detectChanges();

      const elem = fixture.debugElement.query(By.css('.wrap-break-word'));
      expect(elem.nativeElement.textContent).toContain('mock-sessionId');
    });

    it('should hide the session ID block when sessionId is null', () => {
      spyOn(route.snapshot.queryParamMap, 'get').and.returnValue(null);

      fixture.detectChanges();

      const elem = fixture.debugElement.query(By.css('.wrap-break-word'));
      expect(elem).toBeNull();
    });
  });

  describe('navigation', () => {
    it('should navigate to /orders when viewOrders() is invoked', () => {
      spyOn(router, 'navigate');

      component.viewOrders();

      expect(router.navigate).toHaveBeenCalledWith(['/orders']);
    });

    it('should navigate to /products when continueShopping() is invoked', () => {
      spyOn(router, 'navigate');

      component.continueShopping();

      expect(router.navigate).toHaveBeenCalledWith(['/products']);
    });

    it('should make both buttons trigger their respective methods on click', () => {
      spyOn(component, 'viewOrders');
      spyOn(component, 'continueShopping');

      fixture.detectChanges();

      const orderBtn = fixture.debugElement.queryAll(By.css('button'))[0];
      const shopBtn = fixture.debugElement.queryAll(By.css('button'))[1];

      orderBtn.triggerEventHandler('click', null);
      shopBtn.triggerEventHandler('click', null);
      expect(component.viewOrders).toHaveBeenCalled();
      expect(component.continueShopping).toHaveBeenCalled();
    });
  });
});