export * from "./types";
export * from "./schemas";

export { default as CustomersPage } from "./pages/CustomersPage";
export { default as LeadsPage } from "./pages/LeadsPage";
export { default as DealsPage } from "./pages/DealsPage";
export { default as MessagesPage } from "./pages/MessagesPage";
export { default as PipelineStagesPage } from "./pages/PipelineStagesPage";
export { default as CustomFieldsPage } from "./pages/CustomFieldsPage";

export { CustomerForm } from "./components/CustomerForm";
export { LeadForm } from "./components/LeadForm";
export { DealForm } from "./components/DealForm";
export { DealDetail } from "./components/DealDetail";
export { DealCard } from "./components/DealCard";
export { DealsBoard } from "./components/DealsBoard";
export { LeadConvertDialog } from "./components/LeadConvertDialog";
export { MessageDetail } from "./components/MessageDetail";
export { PipelineStageForm } from "./components/PipelineStageForm";
export { PipelineStagesList } from "./components/PipelineStagesList";
export { ActivityFeed } from "./components/ActivityFeed";
export { AttachmentsPanel } from "./components/AttachmentsPanel";
export { CustomFieldForm } from "./components/CustomFieldForm";
export { CustomFieldsSection } from "./components/CustomFieldsSection";

export { customersService } from "./services/customersService";
export { leadsService } from "./services/leadsService";
export { dealsService } from "./services/dealsService";
export { messagesService } from "./services/messagesService";
export { pipelineStagesService } from "./services/pipelineStagesService";
export { attachmentsService } from "./services/attachmentsService";
export { crmViewsService } from "./services/crmViewsService";
export { crmFiltersService } from "./services/crmFiltersService";
export { crmSearchesService } from "./services/crmSearchesService";
export { customFieldsService } from "./services/customFieldsService";
export { customFieldValuesService } from "./services/customFieldValuesService";
export { emailService } from "./services/emailService";
export { storageService } from "./services/storageService";
