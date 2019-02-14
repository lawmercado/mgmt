import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CategoryData, PeriodData, CategoryExpenseIntentData, DatabaseService } from 'src/services/database.service';

@Component({
  selector: 'app-period-modal',
  templateUrl: './period-modal.component.html',
  styleUrls: ['./period-modal.component.scss']
})
export class PeriodModalComponent implements OnInit {
  
  @Input() title: string;
  @Input() period: PeriodData;

  private categoriesExpenseIntent: CategoryExpenseIntentData[];

  private periodForm: FormGroup;

  constructor(private db: DatabaseService, private formBuilder: FormBuilder, private modalCtrl: ModalController) {
    this.periodForm = this.formBuilder.group({
      id: [''],
      month: ['', Validators.required],
      categoriesExpenseIntent: new FormGroup({})
    });
    
    this.db.listCategories()
      .then((categories: CategoryData[]) => {
        this.categoriesExpenseIntent = [];

        let group = new FormGroup({});

        for(let i = 0; i < categories.length; i++) {
          let category = categories[i];

          this.categoriesExpenseIntent.push({ id: null, 'category': category, total: 0 });

          group.addControl(category.name, new FormControl('', Validators.pattern(/^$|([0-9]+\.[0-9]{2})/)));
        }

        this.periodForm.setControl('categoriesExpenseIntent', group);
      })
      .catch((err) => {
        console.error('Unable to get the categories');
        console.error(err);
      });
  }

  ngOnInit() {
    if(this.period) {
      this.periodForm.get('id').setValue(this.period.id);
      this.periodForm.get('month').setValue(this.period.month);

      for(let i = 0; i < this.period.categoriesExpenseIntent.length; i++) {
        let intent = this.period.categoriesExpenseIntent[i];
        this.periodForm.get('categoriesExpenseIntent.' + intent.category.name).setValue(intent.total);
      }
    }
  }

  onSubmit() {
    let data: PeriodData;
    
    for(let i = 0; i < this.categoriesExpenseIntent.length; i++) {
      let value = this.periodForm.get('categoriesExpenseIntent.' + this.categoriesExpenseIntent[i].category.name).value;

      this.categoriesExpenseIntent[i].total = value ? parseFloat(value) : 0.0;
    }

    data = {
      id: this.period ? this.period.id : null,
      month: this.periodForm.get('month').value,
      categoriesExpenseIntent: this.categoriesExpenseIntent,
      expenses: []
    }

    return this.modalCtrl.dismiss(data);
  }

  dismissModal() {
    this.modalCtrl.dismiss();
  }
}