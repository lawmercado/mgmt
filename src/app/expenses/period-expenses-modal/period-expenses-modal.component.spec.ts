import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodExpensesModalComponent } from './period-expenses-modal.component';

describe('PeriodExpensesModalComponent', () => {
  let component: PeriodExpensesModalComponent;
  let fixture: ComponentFixture<PeriodExpensesModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeriodExpensesModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodExpensesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
