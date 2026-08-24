/**
 * Shared Clerk Appearance Configuration for RecycleX Authentication Portals.
 * Customizes Clerk elements to blend seamlessly into the RecycleX outer card
 * without double nesting, borders, shadows, or fixed-width overflows.
 */
export const clerkAppearanceConfig = {
  variables: {
    colorPrimary: "#0F766E",
    colorText: "#111827",
    colorTextSecondary: "#64748B",
    colorBackground: "transparent",
    colorInputBackground: "#FFFFFF",
    colorInputBorder: "#CBD5E1",
    borderRadius: "0.5rem",
    fontFamily: "Inter, sans-serif",
    fontSize: "0.875rem",
  },
  elements: {
    rootBox: "w-full max-w-full m-0 p-0 shadow-none border-none bg-transparent",
    cardBox: "w-full max-w-full shadow-none border-none bg-transparent m-0 p-0",
    card: "w-full max-w-full bg-transparent shadow-none border-none p-0 m-0",
    main: "w-full max-w-full p-0 m-0 flex flex-col gap-4",
    header: "hidden",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton:
      "w-full flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2.5 px-4 transition-colors shadow-2xs box-border",
    socialButtonsBlockButtonText: "text-xs font-semibold text-slate-700",
    socialButtonsBlockButtonArrow: "hidden",
    dividerRow: "w-full my-3 flex items-center justify-center gap-2",
    dividerLine: "bg-slate-200 flex-1 h-[1px]",
    dividerText: "text-[11px] text-slate-400 font-semibold uppercase tracking-wider px-2",
    form: "w-full flex flex-col gap-3 m-0 p-0",
    formFieldRow: "w-full flex flex-col gap-1",
    formField: "w-full flex flex-col gap-1",
    formFieldLabelRow: "flex justify-between items-center w-full mb-1",
    formFieldLabel: "text-xs font-semibold text-slate-700",
    formFieldInput:
      "w-full rounded-lg border border-slate-300 bg-white text-slate-900 text-xs py-2.5 px-3 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] shadow-2xs box-border transition-colors",
    formButtonPrimary:
      "w-full bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-2xs box-border mt-1",
    footer: "hidden",
    footerAction: "hidden",
    identityPreviewText: "text-xs font-medium text-slate-700",
    identityPreviewEditButton: "text-xs text-[#0F766E] font-semibold hover:underline ml-2",
    formResendCodeLink: "text-xs text-[#0F766E] font-semibold hover:underline",
    otpCodeFieldInput: "border-slate-300 focus:border-[#0F766E] text-slate-900 font-bold rounded-md",
  },
};
