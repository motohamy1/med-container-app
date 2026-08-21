import { SpecialtyData } from './SpecialtyData';
import { GI_SURGERY_SPECIALTY } from './surgical/giSurgery';
import { NEUROSURGERY_SPECIALTY } from './surgical/neuroSurgery';
import { CARDIOTHORACIC_SURGERY_SPECIALTY } from './surgical/cardioSurgery';
import { VASCULAR_SURGERY_SPECIALTY } from './surgical/vascularSurgery';
import { TRAUMA_SURGERY_SPECIALTY } from './surgical/traumaSurgery';
import { ORTHOPEDIC_SURGERY_SPECIALTY } from './surgical/orthoSurgery';
import { UROLOGY_SURGERY_SPECIALTY } from './surgical/urologySurgery';
import { EXPANDED_SURGICAL_KNOWLEDGE } from './surgical/expandedSurgery';

export const SURGICAL_SPECIALTY_KNOWLEDGE: Record<string, SpecialtyData> = {
  surgery_gi: GI_SURGERY_SPECIALTY,
  surgery_neuro: NEUROSURGERY_SPECIALTY,
  surgery_cardio: CARDIOTHORACIC_SURGERY_SPECIALTY,
  surgery_vascular: VASCULAR_SURGERY_SPECIALTY,
  surgery_trauma: TRAUMA_SURGERY_SPECIALTY,
  surgery_ortho: ORTHOPEDIC_SURGERY_SPECIALTY,
  surgery_urology: UROLOGY_SURGERY_SPECIALTY,
  ...EXPANDED_SURGICAL_KNOWLEDGE,
};
