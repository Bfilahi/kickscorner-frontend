import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'zone.js';

import { Footer } from './footer';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('Footer', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should set the #year elements\'s text content to the current year at initialization', () => {
    const currentYear = new Date().getFullYear();

    fixture.detectChanges();

    const yearElem = fixture.debugElement.query(By.css('#year')).nativeElement.textContent;
    expect(yearElem).toBe(currentYear.toString());
  });

});
