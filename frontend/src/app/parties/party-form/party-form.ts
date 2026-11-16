import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { PartyClient } from '../party-service';
import { PartyFormModel, PartyRes, toFormModel } from '../party';
import {
  form,
  max,
  maxLength,
  min,
  minLength,
  required,
  validate,
  FormRoot,
  FormField,
} from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { TagsService } from '../../tags/tags.service';
import { FormsModule } from '@angular/forms';
import { ImageUpload } from '../../shared/components/image-upload/image-upload';

@Component({
  imports: [FormRoot, RouterLink, FormField, FormsModule, ImageUpload],
  selector: 'app-party-form',
  styleUrl: './party-form.css',
  templateUrl: './party-form.html',
})
export class PartyForm implements OnInit {
  private readonly partyClient = inject(PartyClient);
  private readonly tagService = inject(TagsService);

  public readonly editingParty = input<PartyRes>();
  protected readonly isEditing = computed(() => this.editingParty() !== undefined);
  public readonly edited = output<PartyRes>();
  protected readonly submitAttempted = signal(false);
  protected readonly submitError = signal<string | null>(null);

  ngOnInit(): void {
  const editingParty = this.editingParty();
  if (editingParty) {
    this.loadForEdit(editingParty);
  }
}

private loadForEdit(party: PartyRes) {
  this.partyFormModel.set(toFormModel(party));
  this.existingImageUrl.set(party.imageUrl);
}

  private readonly partyFormModel = signal<PartyFormModel>({
    title: '',
    description: '',
    city: '',
    adress: '',
    price: 0,
    dateTime: '',
    guestLimit: 0,
    partyAccesibility: false,
    tagsList: [],
    imageUrl: null,
  });

  protected readonly partyForm = form(
    this.partyFormModel,
    (party) => {
      required(party.title, { message: 'Requerido' });
      minLength(party.title, 5, { message: 'Como mínimo 5 caracteres' });
      maxLength(party.title, 30, { message: 'Máximo 30 caracteres' });

      required(party.description, { message: 'Requerido' });
      minLength(party.description, 20, { message: 'Como mínimo 20 caracteres' });
      maxLength(party.description, 500, { message: 'Máximo 500 caracteres' });

      required(party.city, { message: 'Requerido' });

      required(party.adress, { message: 'Requerido' });
      minLength(party.adress, 20, { message: 'Como mínimo 20 caracteres' });
      maxLength(party.adress, 500, { message: 'Máximo 500 caracteres' });

      required(party.price, { message: 'Requerido' });
      min(party.price, 0, { message: 'El valor no puede ser menor a 0' });
      max(party.price, 500000, { message: 'El valor no puede superar los $ 500.000' });

      required(party.dateTime, { message: 'Requerido' });
      validate(party.dateTime, ({ value }) => {
        const dateValue = value();
        if (!dateValue) return null;
        const partyDate = new Date(dateValue);

        if (isNaN(partyDate.getTime())) {
          return { kind: 'invalidDate', message: 'Fecha inválida' };
        }

        if (partyDate < new Date()) {
          return { kind: 'pastDate', message: 'La fecha no puede ser anterior a la actual' };
        }

        return null;
      });

      required(party.guestLimit, { message: 'Requerido' });
      min(party.guestLimit, 0, { message: 'El aforo no puede ser menor a 0' });

      required(party.tagsList, { message: 'Requerido' });

      required(party.imageUrl, { message: 'Requerido', when: () => !this.isEditing(),});
    },
    {
      submission: {
        onInvalid: () => this.submitAttempted.set(true),
        action: async (field) => {
          if (!confirm('Desea confirmar los datos?')) return;

          this.submitAttempted.set(true);
          this.submitError.set(null);
          await new Promise((resolve) => setTimeout(resolve, 500)); // simulamos latencia
          const party = field().value();
          const editingParty = this.editingParty();
          if (this.isEditing() && editingParty) {
            const { externalId } = editingParty;
            this.partyClient.updateParty(externalId, party).subscribe({
              next: (party) => {
                alert('Producto modificado con éxito!');
                this.edited.emit(party);
              },
              error: () => this.submitError.set('No se pudo modificar el evento. Intenta nuevamente.'),
            });
          } else {
            this.partyClient.addParty(party).subscribe({
              next: () => {
                alert('Se Agrego el producto con éxito!');
                this.resetForm();
              },
              error: () => this.submitError.set('No se pudo publicar el evento. Intenta nuevamente.'),
            });
          }
        },
      },
    },
  );

  resetForm() {
    this.partyForm().reset({
      title: '',
      description: '',
      city: '',
      adress: '',
      price: 0,
      dateTime: '',
      guestLimit: 0,
      partyAccesibility: false,
      tagsList: [],
      imageUrl: null,
    });
  }

  protected readonly tagsResource = this.tagService.getTagsResource();

  protected isSelected(name: string): boolean {
    return this.partyForm.tagsList().value().includes(name);
  }

  protected toggleTag(name: string): void {
    const field = this.partyForm.tagsList();
    field.value.update((tags) =>
      tags.includes(name) ? tags.filter((t) => t !== name) : [...tags, name],
    );
    field.markAsTouched();
  }

  protected readonly tickets = signal<boolean>(true);

  protected setTickets(paid: boolean) {
    this.tickets.set(paid);
    if (!paid) {
      this.partyForm.price().value.set(0);
    }
  }

  protected readonly existingImageUrl = signal<string | null>(null);

}
