# Experience Import API Guide

## Overview
This API allows you to import multiple experience records from a JSON file into the database.

## Endpoint
```
POST /api/import/experiences
```

## Features
1. Read JSON file from form data (multipart/form-data)
2. Store records in the experience table
3. Convert `status`, `difficultyLevel`, and `guideType` to lowercase
4. Handle season lookup/creation based on season name, company_id, and site_id

## How to Use in Postman

### Step 1: Setup Request
1. Method: `POST`
2. URL: `http://your-api-url/api/import/experiences`
3. Headers: (Postman will automatically add Content-Type for multipart/form-data)

### Step 2: Select Body Tab
1. Select **form-data** option
2. Change the first row key type from "Text" to "File"
3. Key name: `file` (must be exactly "file")
4. Value: Select your JSON file using the "Select Files" button

### Step 3: JSON File Format
Your JSON file should have this structure:

```json
{
  "activities": [
    {
      "name": "Experience Name",
      "activity_status": "APPROVED",
      "difficulty_level": "EASY",
      "guide_type": "EXTERNAL",
      "company_id": "your-company-id",
      "site_id": "your-site-id",
      "department_id": "your-department-id",
      "season": "WHOLE_YEAR",
      "initiated_by_id": "user-id",
      "duration": "3.5",
      "guided": 1,
      "excursion": 1,
      "travel_medium": "Auto Rickshaw",
      "pax_limit": 3,
      "no_of_guides": 1,
      "description_of_activity": "Description here",
      "activity_experience": "Experience details",
      "activity_features": "Features here",
      "experience_detailing": "Details",
      "participating_info": "Who can participate",
      "wearables": "What to wear",
      "rules": "Rules and regulations",
      "carriables_items": "Items to carry",
      "package_inclusion": "What's included",
      "package_exclusion": "What's excluded",
      "additional_info": "Additional information",
      "safety_protocol": "Safety protocols",
      "cost_detailing": "Cost breakdown",
      "billing_instruction": "Billing instructions"
    }
  ]
}
```

### Step 4: Send Request
Click the "Send" button in Postman.

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Successfully imported 2 out of 2 experiences",
  "data": {
    "imported": [
      {
        "id": 1,
        "name": "Tuk-Tuk Experience in Fort Kochi",
        "status": "approved",
        "seasonId": 5
      }
    ],
    "errors": null,
    "summary": {
      "total": 2,
      "successful": 2,
      "failed": 0
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid JSON format",
  "errors": [
    {
      "path": "activities",
      "message": "Activities must be an array"
    }
  ]
}
```

## Field Mappings

| Source Field | Target Field | Transform |
|-------------|--------------|-----------|
| `name` | `name` | - |
| `activity_status` | `status` | Converted to lowercase |
| `difficulty_level` | `difficultyLevel` | Converted to lowercase |
| `guide_type` | `guideType` | Converted to lowercase |
| `company_id` | `company_id` | - |
| `site_id` | `site_id` | - |
| `department_id` | `department_id` | - |
| `season` | `seasonId` | Lookup by name, company_id, site_id; creates if not exists |
| `guided` | `isGuided` | Boolean (1 or true) |
| `excursion` | `isExcursion` | Boolean (1 or true) |
| `pax_limit` | `maximumParticipant` | - |
| `duration` | `duration` | - |
| `travel_medium` | `travellMedium` | - |
| `no_of_guides` | `noOfGuides` | Converted to string |
| `description_of_activity` | `whatWillYouDo` | - |
| `activity_experience` | `whatYouWillExperience` | - |
| `activity_features` | `experienceHighlights` | - |
| `experience_detailing` | `stepByStepItinerary` | - |
| `participating_info` | `whoCanParticipate` | - |
| `wearables` | `whatToWear` | - |
| `rules` | `rulesAndRegulation` | - |
| `carriables_items` | `carriableItems` | - |
| `package_inclusion` | `whatsIncluded` | Split by newline |
| `package_exclusion` | `whatsExcluded` | Split by newline |
| `additional_info` | `additionalInformation` | - |
| `safety_protocol` | `safetyProtocols` | - |
| `cost_detailing` | `costBreakdown` | - |
| `billing_instruction` | `billingInstructions` | - |

## Notes
- `categoryId` is always set to null/undefined as per requirements
- Seasons are automatically created if they don't exist
- All uploaded files are automatically deleted after processing
- Only JSON files are accepted
- Maximum file size: 10MB

## Important: Delete Flag Logic

The `is_delete` field is automatically set based on the `activity_status`:
- If `activity_status` is "DELETED" (case-insensitive), then `is_delete` = `true`
- For any other status (APPROVED, DRAFT, etc.), `is_delete` = `false`

Example:
- `activity_status: "APPROVED"` → `is_delete: false`, `status: "approved"`
- `activity_status: "DELETED"` → `is_delete: true`, `status: "deleted"`
- `activity_status: "DRAFT"` → `is_delete: false`, `status: "draft"`

## Testing
Use the provided `sample-import-data.json` file for testing.

