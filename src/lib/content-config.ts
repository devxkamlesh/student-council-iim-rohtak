// Shared, framework-agnostic config that drives the admin content CRUD for
// team members, committees, and clubs. Used by BOTH the client form and the
// server API. All table/column names come from here (never user input), so
// they are safe to interpolate into SQL.

export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "email"
  | "url"
  | "number"
  | "select"
  | "time";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
};

export type ContentEntity = {
  key: string;
  table: string;
  permission: string;
  title: string;
  singular: string;
  fields: Field[];
  /** field names shown as columns in the list table */
  listColumns: string[];
};

export type ContentRow = Record<
  string,
  string | number | boolean | null
> & { id: number };

export const CONTENT: Record<string, ContentEntity> = {
  team: {
    key: "team",
    table: "team_members",
    permission: "content.team",
    title: "Team Members",
    singular: "Team Member",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "position", label: "Position", type: "text", required: true },
      { name: "email", label: "Email", type: "email" },
      { name: "linkedin_url", label: "LinkedIn URL", type: "url" },
      { name: "image_url", label: "Photo URL", type: "url" },
      {
        name: "council_batch",
        label: "Council Batch",
        type: "select",
        options: [
          { value: "SC16", label: "SC'16 (Current)" },
          { value: "SC15", label: "SC'15 (Previous)" },
        ],
      },
      { name: "display_order", label: "Display Order", type: "number" },
    ],
    listColumns: ["name", "position", "council_batch"],
  },
  committees: {
    key: "committees",
    table: "committees",
    permission: "content.committees",
    title: "Committees",
    singular: "Committee",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "description", label: "Description", type: "richtext" },
      { name: "email", label: "Email", type: "email" },
      { name: "instagram_url", label: "Instagram URL", type: "url" },
      { name: "linkedin_url", label: "LinkedIn URL", type: "url" },
      { name: "facebook_url", label: "Facebook URL", type: "url" },
      { name: "image_url", label: "Logo URL", type: "url" },
      { name: "display_order", label: "Display Order", type: "number" },
    ],
    listColumns: ["name", "email"],
  },
  clubs: {
    key: "clubs",
    table: "clubs",
    permission: "content.clubs",
    title: "Clubs",
    singular: "Club",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "club_type", label: "Type", type: "select", options: [
          { value: "domain", label: "Domain" },
          { value: "recreational", label: "Recreational" },
        ],
      },
      { name: "description", label: "Description", type: "richtext" },
      { name: "email", label: "Email", type: "email" },
      { name: "instagram_url", label: "Instagram URL", type: "url" },
      { name: "linkedin_url", label: "LinkedIn URL", type: "url" },
      { name: "facebook_url", label: "Facebook URL", type: "url" },
      { name: "image_url", label: "Logo URL", type: "url" },
      { name: "display_order", label: "Display Order", type: "number" },
    ],
    listColumns: ["name", "club_type"],
  },
  highlights: {
    key: "highlights",
    table: "highlights",
    permission: "content.homepage",
    title: "Homepage Cards",
    singular: "Card",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "richtext", required: true },
      { name: "href", label: "Link (e.g. /committees)", type: "text", required: true },
      {
        name: "icon_key",
        label: "Icon",
        type: "select",
        options: [
          { value: "committees", label: "Committees" },
          { value: "clubs", label: "Clubs" },
          { value: "events", label: "Events" },
          { value: "leave", label: "Leave" },
        ],
      },
      { name: "display_order", label: "Display Order", type: "number" },
    ],
    listColumns: ["title", "href"],
  },
  shuttle: {
    key: "shuttle",
    table: "shuttle_timings",
    permission: "content.leave",
    title: "Shuttle Timings",
    singular: "Shuttle Time",
    fields: [
      {
        name: "day_of_week",
        label: "Day",
        type: "select",
        required: true,
        options: [
          { value: "monday", label: "Monday" },
          { value: "tuesday", label: "Tuesday" },
          { value: "wednesday", label: "Wednesday" },
          { value: "thursday", label: "Thursday" },
          { value: "friday", label: "Friday" },
          { value: "saturday", label: "Saturday" },
          { value: "sunday", label: "Sunday" },
        ],
      },
      { name: "from_campus_time", label: "From Campus", type: "time", required: true },
      { name: "from_rajiv_chowk_time", label: "From Rajiv Chowk", type: "time", required: true },
      { name: "display_order", label: "Display Order", type: "number" },
    ],
    listColumns: ["day_of_week", "from_campus_time", "from_rajiv_chowk_time"],
  },
  other_timings: {
    key: "other_timings",
    table: "other_timings",
    permission: "content.leave",
    title: "Other Timings",
    singular: "Timing",
    fields: [
      { name: "label", label: "Label", type: "text", required: true },
      { name: "time_value", label: "Time", type: "text", required: true },
      { name: "display_order", label: "Display Order", type: "number" },
    ],
    listColumns: ["label", "time_value"],
  },
};
