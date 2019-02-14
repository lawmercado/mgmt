import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CategoryData } from 'src/services/database.service';

@Component({
  selector: 'app-category-modal',
  templateUrl: './category-modal.component.html',
  styleUrls: ['./category-modal.component.scss']
})
export class CategoryModalComponent implements OnInit {

  @Input() title: string;
  @Input() category: CategoryData;

  private categoryForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private modalCtrl: ModalController) {
    this.categoryForm = this.formBuilder.group({
      id: [''],
      name: ['', Validators.required],
      color: ['', Validators.required]
    });
  }

  ngOnInit() {
    if(this.category) {
      this.categoryForm.get('id').setValue(this.category.id);
      this.categoryForm.get('name').setValue(this.category.name);
      this.categoryForm.get('color').setValue(this.category.color);
    }
  }

  onSubmit() {
    let category: CategoryData;
    
    category = {
      id: this.categoryForm.get('id').value ? this.categoryForm.get('id').value : null,
      name: this.categoryForm.get('name').value,
      color: this.categoryForm.get('color').value
    }

    this.modalCtrl.dismiss(category);
  }

  dismissModal() {
    this.modalCtrl.dismiss();
  }
}
