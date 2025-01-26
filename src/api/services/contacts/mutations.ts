import { basicMutations } from './mutations/basicMutations';
import { reminderMutations } from './mutations/reminderMutations';
import { relationshipMutations } from './mutations/relationshipMutations';
import { followupMutations } from './mutations/followupMutations';
import { tagsMutations } from './mutations/tagsMutations';

export const contactMutations = {
  ...basicMutations,
  ...reminderMutations,
  ...relationshipMutations,
  ...followupMutations,
  ...tagsMutations
};