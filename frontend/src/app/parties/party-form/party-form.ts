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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TagsService } from '../../tags/tags.service';
import { FormsModule } from '@angular/forms';
import { ImageUpload } from '../../shared/components/image-upload/image-upload';
import { ConfirmModalService } from '../../shared/components/modal-dialog/modal-dialog-service';
import { finalize, firstValueFrom } from 'rxjs';

@Component({
  imports: [FormRoot, RouterLink, FormField, FormsModule, ImageUpload],
  selector: 'app-party-form',
  styleUrl: './party-form.css',
  templateUrl: './party-form.html',
})
export class PartyForm implements OnInit {
  private readonly partyClient = inject(PartyClient);
  private readonly tagService = inject(TagsService);
  private readonly confirmModal = inject(ConfirmModalService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly editingPartyId = this.route.snapshot.paramMap.get('id');

  public readonly editingParty = input<PartyRes>();
  protected readonly isEditing = computed(
    () => this.editingParty() !== undefined || this.editingPartyId !== null,
  );
  public readonly edited = output<PartyRes>();
  protected readonly isLoadingParty = signal(false);
  protected readonly partyLoadError = signal<string | null>(null);
  protected readonly submitAttempted = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly submitSuccess = signal<string | null>(null);
  protected readonly isSubmitting = signal(false);

  ngOnInit(): void {
    const editingParty = this.editingParty();
    if (editingParty) {
      this.loadForEdit(editingParty);
    } else if (this.editingPartyId) {
      this.isLoadingParty.set(true);
      this.partyClient
        .getById(this.editingPartyId)
        .pipe(finalize(() => this.isLoadingParty.set(false)))
        .subscribe({
          next: (party) => this.loadForEdit(party),
          error: () =>
            this.partyLoadError.set('No se pudo cargar el evento para editar. Intentá nuevamente.'),
        });
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
    tickets: false,
  });

  protected readonly partyForm = form(
    this.partyFormModel,
    (party) => {
      required(party.title, { message: 'Requerido' });
      minLength(party.title, 5, { message: 'Como mínimo 5 caracteres' });
      maxLength(party.title, 30, { message: 'Máximo 30 caracteres' });

      required(party.description, { message: 'Requerido' });
      minLength(party.description, 20, { message: 'Como mínimo 20 caracteres' });
      maxLength(party.description, 1000, { message: 'Máximo 1000 caracteres' });

      required(party.city, { message: 'Requerido' });

      required(party.adress, { message: 'Requerido' });
      minLength(party.adress, 5, { message: 'Como mínimo 5 caracteres' });
      maxLength(party.adress, 50, { message: 'Máximo 50 caracteres' });

      required(party.price, { message: 'Requerido' });
      min(party.price, 0, { message: 'El valor no puede ser menor a 0' });
      max(party.price, 1000000, { message: 'El valor no puede superar los $ 1.000.000' });

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

      required(party.imageUrl, { message: 'Requerido', when: () => !this.isEditing() });
    },
    {
      submission: {
        onInvalid: () => this.submitAttempted.set(true),
        action: async (field) => {
          const confirmed = await this.confirmModal.open({
            variant: 'publish-event',
            icon: 'publish-event',
            title: this.isEditing() ? '¿Guardar los cambios?' : '¿Publicar el evento?',
            description: 'Revisa que los datos del evento sean correctos antes de continuar.',
            cancelLabel: 'Seguir editando',
            confirmLabel: this.isEditing() ? 'Guardar cambios' : 'Publicar evento',
          });
          if (!confirmed) return;

          this.submitAttempted.set(true);
          this.submitError.set(null);
          this.submitSuccess.set(null);
          this.isSubmitting.set(true);
          const party = field().value();
          const editingParty = this.editingParty();
          const partyId = editingParty?.externalId ?? this.editingPartyId;
          try {
            if (partyId) {
              const updatedParty = await firstValueFrom(
                this.partyClient.updateParty(partyId, party),
              );
              this.submitSuccess.set('Evento modificado con éxito.');
              this.edited.emit(updatedParty);
              await this.router.navigate(['/parties', partyId]);
            } else {
              const createdParty = await firstValueFrom(this.partyClient.addParty(party));
              this.submitSuccess.set('Evento publicado con éxito.');
              await new Promise<void>((resolve) => window.setTimeout(resolve, 2000));
              await this.router.navigate(['/parties', createdParty.externalId]);
            }
          } catch {
            this.submitError.set(
              this.isEditing()
                ? 'No se pudo modificar el evento. Intenta nuevamente.'
                : 'No se pudo publicar el evento. Intenta nuevamente.',
            );
          } finally {
            this.isSubmitting.set(false);
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
      tickets: false,
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

  protected setTickets(paid: boolean) {
  this.partyForm.tickets().value.set(paid);
  if (!paid) {
    this.partyForm.price().value.set(0);
  }
}

  protected readonly existingImageUrl = signal<string | null>(null);

  protected onImageChanged(event: { fieldName: string; file: File | null }): void {
    const field = this.partyForm.imageUrl();
    field.value.set(event.file as any); // ajustá el tipo de imageUrl en PartyFormModel a `File | string | null`
    field.markAsTouched();
  }
}
