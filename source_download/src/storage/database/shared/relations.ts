import { relations } from "drizzle-orm/relations";
import { sdkTemplates, sdkTemplateComponents, adComponents } from "./schema";

export const sdkTemplateComponentsRelations = relations(sdkTemplateComponents, ({one}) => ({
	sdkTemplate: one(sdkTemplates, {
		fields: [sdkTemplateComponents.templateId],
		references: [sdkTemplates.id]
	}),
	adComponent: one(adComponents, {
		fields: [sdkTemplateComponents.componentId],
		references: [adComponents.id]
	}),
}));

export const sdkTemplatesRelations = relations(sdkTemplates, ({many}) => ({
	sdkTemplateComponents: many(sdkTemplateComponents),
}));

export const adComponentsRelations = relations(adComponents, ({many}) => ({
	sdkTemplateComponents: many(sdkTemplateComponents),
}));