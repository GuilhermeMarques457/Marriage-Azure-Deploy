import { Component } from '@angular/core';
import { Marriage } from './marriage.model';
import { Store } from '@ngrx/store';
import {
  addMarriage,
  clearError,
  getMarriages,
} from './store/marriage.actions';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { TransformHourToCorrectFormat } from '../../shared/transformers/hour-transformer';
import { AppState } from '../../store/app.reducer';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { InputFieldComponent } from '../../shared/components/input-field/input-field.component';
import { MarriageErrors } from '../../shared/components/input-field/marriage-validation';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-marriage',
  templateUrl: './marriage.component.html',
  styleUrls: ['./marriage.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AlertComponent,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    InputFieldComponent,
    MatButtonModule,
  ],
})
export class MarriageComponent {
  recipes: Marriage[];

  marriageForm: FormGroup;
  submitted = false;
  isLoading = false;

  constructor(private store: Store<AppState>, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.marriageForm = new FormGroup({
      photo: new FormControl(null),
      date: new FormControl(null, [Validators.required]),
      hour: new FormControl(null, [Validators.required]),
      moneyExpected: new FormControl(null),
      local: new FormControl(null, [Validators.required]),
    });
  }

  photoErrors = MarriageErrors.photoErrors;
  dateErrors = MarriageErrors.dateErrors;
  hourErrors = MarriageErrors.hourErrors;
  localErrors = MarriageErrors.localErrors;

  onGetMarriages() {
    this.store.dispatch(getMarriages());
  }

  onSubmit() {
    this.submitted = true;
    if (!this.marriageForm.valid) return;

    const marriage = new Marriage(
      this.marriageForm.value.photo,
      this.marriageForm.value.date,
      TransformHourToCorrectFormat.transform(this.marriageForm.value.hour),
      this.marriageForm.value.moneyExpected,
      this.marriageForm.value.local
    );

    console.log(marriage);

    this.store.dispatch(addMarriage({ Marriage: marriage }));

    // this.loginForm.reset();
  }

  onHandleError() {
    this.store.dispatch(clearError());
  }
}
