import type { DocumentReference } from 'firebase/firestore';

import { getAreaByRef } from '#/areas/service';
import { getCategoryByRef } from '#/categories/service';
import { getDocs, mealsCollection } from '#/firebase/firestore';
import type { IngredientReference } from '#/ingredients/abstracts';
import { getIngredientByRef } from '#/ingredients/service';
import type { FirestoreMeal, GetMeals } from '#/meals/abstracts';
import type { Tag } from '#/tags/domain';
import { getTagByRef } from '#/tags/service';
import type { MealIngredient } from '../domain';

const getMeals: GetMeals = async () => {
  const snapshot = await getDocs(mealsCollection);
  const meals: FirestoreMeal[] = [];

  snapshot.forEach((s) => {
    const data = s.data() as FirestoreMeal;

    meals.push(data);
  });

  return Promise.all(
    meals.map(async (m) => {
      const area = await getAreaByRef(m.areaRef);
      const category = await getCategoryByRef(m.categoryRef);
      const tags: Tag[] = await Promise.all(
        m.tags.map((tagRef: DocumentReference) => getTagByRef(tagRef)),
      );

      const ingredients: MealIngredient[] = await Promise.all(
        m.ingredients.map(async (ingredient: IngredientReference) => ({
          ...ingredient,
          ingredient: await getIngredientByRef(ingredient.ingredientRef),
        })),
      );

      return {
        id: m.id,
        name: m.name,
        instructions: m.instructions,
        image: m.image,
        area,
        category,
        tags,
        ingredients,
      };
    }),
  );
};

export default getMeals;
