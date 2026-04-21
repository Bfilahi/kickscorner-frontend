import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'zone.js';

import { Newsletter } from './newsletter';
import { By } from '@angular/platform-browser';
import { NgForm } from '@angular/forms';

describe('Newsletter', () => {
  let component: Newsletter;
  let fixture: ComponentFixture<Newsletter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Newsletter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Newsletter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset the form after submission', () => {
    const formElem = fixture.debugElement.query(By.directive(NgForm)).injector.get(NgForm);
    spyOn(formElem, 'reset');

    component.sendNewsLetter(formElem);

    expect(formElem.reset).toHaveBeenCalled();
  });
});
