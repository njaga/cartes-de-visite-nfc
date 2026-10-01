"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, MouseEvent } from "react";
import { ArrowUpRight, CalendarDays, X } from "lucide-react";
import {
  appointmentMailto,
  calendarUrl,
  contactEmail,
  contactPhone,
  localDate,
  requestedAppointmentDate,
} from "@/lib/profile-appointment";

type ProfileAppointmentProps = {
  name: string;
  email: string;
  whatsapp?: string;
  appointmentUrl?: string;
  className?: string;
  triggerLabel?: string;
  triggerIcon?: "calendar" | "arrow";
};

type AppointmentFields = {
  visitorName: string;
  date: string;
  time: string;
  meetingType: string;
  message: string;
};

export function ProfileAppointment({
  name,
  email,
  whatsapp,
  appointmentUrl,
  className,
  triggerLabel = "Prendre rendez-vous",
  triggerIcon = "calendar",
}: ProfileAppointmentProps) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const reviewRef = useRef<HTMLHeadingElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [minimumDate, setMinimumDate] = useState("");
  const [error, setError] = useState("");
  const [request, setRequest] = useState<string | null>(null);
  const [fields, setFields] = useState<AppointmentFields>({
    visitorName: "",
    date: "",
    time: "",
    meetingType: "Par téléphone",
    message: "",
  });
  const directCalendarUrl = calendarUrl(appointmentUrl);
  const recipient = contactEmail(email);
  const phone = contactPhone(whatsapp);
  const buttonClassName = className ?? "vp-button vp-button-primary";
  const TriggerIcon = triggerIcon === "arrow" ? ArrowUpRight : CalendarDays;

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (request) reviewRef.current?.focus();
    else if (isOpen) nameRef.current?.focus();
  }, [request, isOpen]);

  function openDialog() {
    setMinimumDate(localDate(new Date()));
    setError("");
    setRequest(null);
    dialogRef.current?.showModal();
    setIsOpen(true);
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  function closeFromBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      closeDialog();
  }

  function updateField(key: keyof AppointmentFields, value: string) {
    setFields((previous) => ({ ...previous, [key]: value }));
    setError("");
    setRequest(null);
  }

  function prepareRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const now = new Date();
    setMinimumDate(localDate(now));

    if (!fields.visitorName.trim()) {
      setError("Indiquez votre nom pour préparer votre demande.");
      nameRef.current?.focus();
      return;
    }

    const requestedDate = requestedAppointmentDate(
      fields.date,
      fields.time,
      now,
    );
    if (!requestedDate) {
      setError("Choisissez une date et, si précisée, une heure à venir.");
      dateRef.current?.focus();
      return;
    }

    const dateLabel = requestedDate.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timeLabel = fields.time
      ? ` à ${fields.time} (fuseau : ${timeZone})`
      : ", à un horaire à convenir";
    setRequest(
      [
        `Bonjour ${name},`,
        "",
        `Je suis ${fields.visitorName.trim()} et je souhaite prendre rendez-vous avec vous.`,
        `Date souhaitée : ${dateLabel}${timeLabel}.`,
        `Format : ${fields.meetingType}.`,
        ...(fields.message.trim() ? ["", fields.message.trim()] : []),
        "",
        "Pourriez-vous me confirmer votre disponibilité ? Merci.",
      ].join("\n"),
    );
    setError("");
  }

  if (directCalendarUrl) {
    return (
      <a
        className={buttonClassName}
        href={directCalendarUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <TriggerIcon aria-hidden="true" />
        <span>{triggerLabel}</span>
      </a>
    );
  }

  return (
    <>
      <button
        ref={triggerRef}
        className={buttonClassName}
        type="button"
        onClick={openDialog}
        aria-haspopup="dialog"
      >
        <TriggerIcon aria-hidden="true" />
        <span>{triggerLabel}</span>
      </button>
      <dialog
        ref={dialogRef}
        className="vp-appointment-dialog"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        onClick={closeFromBackdrop}
        onClose={() => {
          setIsOpen(false);
          triggerRef.current?.focus();
        }}
      >
        <div className="vp-appointment-panel">
          <div className="vp-appointment-header">
            <div>
              <h2 id={`${id}-title`}>Prendre rendez-vous</h2>
            </div>
            <button
              type="button"
              className="vp-appointment-close"
              aria-label="Fermer la demande de rendez-vous"
              onClick={closeDialog}
            >
              <X aria-hidden="true" />
            </button>
          </div>
          <p id={`${id}-description`}>
            Proposez un rendez-vous à {name}. Le créneau sera confirmé
            directement avec vous.
          </p>
          {!recipient && !phone ? (
            <p className="vp-appointment-note">
              Aucun contact de rendez-vous n’est disponible pour le moment.
              Utilisez les coordonnées indiquées sur ce profil.
            </p>
          ) : request ? (
            <div className="vp-appointment-review">
              <h3 ref={reviewRef} tabIndex={-1}>
                Votre demande est prête
              </h3>
              <p>
                Choisissez un moyen de contact, puis envoyez le message depuis
                votre application.
              </p>
              <p className="vp-appointment-summary">{request}</p>
              <p className="vp-appointment-note">
                Aucun message n’a encore été envoyé. Le rendez-vous reste soumis
                à confirmation.
              </p>
              <div className="vp-appointment-actions">
                {recipient && (
                  <a
                    className="vp-button vp-button-primary"
                    href={appointmentMailto(recipient, name, request)}
                  >
                    Ouvrir mon application e-mail
                  </a>
                )}
                {phone && (
                  <a
                    className="vp-button vp-button-secondary"
                    href={`https://wa.me/${phone}?text=${encodeURIComponent(request)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Continuer sur WhatsApp
                  </a>
                )}
              </div>
              <button
                type="button"
                className="vp-appointment-edit"
                onClick={() => {
                  setRequest(null);
                  setError("");
                }}
              >
                Modifier ma demande
              </button>
            </div>
          ) : (
            <form className="vp-appointment-form" onSubmit={prepareRequest}>
              <div className="vp-appointment-fields">
                <div className="vp-appointment-field vp-appointment-field-full">
                  <label htmlFor={`${id}-name`}>
                    Votre nom <span aria-hidden="true">*</span>
                  </label>
                  <input
                    ref={nameRef}
                    id={`${id}-name`}
                    name="visitorName"
                    autoComplete="name"
                    autoFocus
                    required
                    maxLength={100}
                    value={fields.visitorName}
                    onChange={(event) =>
                      updateField("visitorName", event.target.value)
                    }
                    placeholder="Prénom et nom"
                  />
                </div>
                <div className="vp-appointment-field">
                  <label htmlFor={`${id}-date`}>
                    Date souhaitée <span aria-hidden="true">*</span>
                  </label>
                  <input
                    ref={dateRef}
                    id={`${id}-date`}
                    name="date"
                    type="date"
                    required
                    min={minimumDate}
                    value={fields.date}
                    onChange={(event) =>
                      updateField("date", event.target.value)
                    }
                  />
                </div>
                <div className="vp-appointment-field">
                  <label htmlFor={`${id}-time`}>
                    Heure souhaitée <small>(facultatif)</small>
                  </label>
                  <input
                    id={`${id}-time`}
                    name="time"
                    type="time"
                    value={fields.time}
                    onChange={(event) =>
                      updateField("time", event.target.value)
                    }
                  />
                </div>
                <div className="vp-appointment-field vp-appointment-field-full">
                  <label htmlFor={`${id}-format`}>
                    Comment souhaitez-vous échanger ?
                  </label>
                  <select
                    id={`${id}-format`}
                    name="meetingType"
                    value={fields.meetingType}
                    onChange={(event) =>
                      updateField("meetingType", event.target.value)
                    }
                  >
                    <option>Par téléphone</option>
                    <option>En visioconférence</option>
                    <option>Sur place</option>
                  </select>
                </div>
                <div className="vp-appointment-field vp-appointment-field-full">
                  <label htmlFor={`${id}-message`}>
                    Votre projet en quelques mots <small>(facultatif)</small>
                  </label>
                  <textarea
                    id={`${id}-message`}
                    name="message"
                    rows={3}
                    maxLength={1200}
                    value={fields.message}
                    onChange={(event) =>
                      updateField("message", event.target.value)
                    }
                    placeholder="De quoi aimeriez-vous discuter ?"
                  />
                </div>
              </div>
              {error && (
                <p className="vp-appointment-error" role="alert">
                  {error}
                </p>
              )}
              <p className="vp-appointment-note">
                * Champs obligatoires. L’heure est celle de votre localisation.
                Vous choisirez ensuite comment envoyer votre demande.
              </p>
              <button className="vp-button vp-button-primary" type="submit">
                Préparer ma demande
              </button>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
