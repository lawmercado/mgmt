import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodModalComponent } from './period-modal.component';

describe('PeriodModalComponent', () => {
  let component: PeriodModalComponent;
  let fixture: ComponentFixture<PeriodModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeriodModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
