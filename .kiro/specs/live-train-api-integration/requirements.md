# Requirements Document

## Introduction

This document specifies the requirements for integrating the RailRadar API into the existing railway optimization system. The system currently uses mock train data that simulates movement. This integration will replace mock data with real-time train information from the RailRadar API, enabling the system to display actual train positions, statuses, and delays while respecting API rate limits and handling errors gracefully.

## Glossary

- **RailRadar_API**: External third-party API service that provides real-time train location and status data
- **API_Service**: Backend service component responsible for fetching data from RailRadar_API
- **Train_Data**: Information about a train including position (latitude/longitude), status, delay, and metadata
- **Rate_Limit**: Maximum number of API requests allowed per time period (1,000 requests/month for free tier)
- **Polling_Interval**: Time duration between consecutive API requests (30-60 seconds)
- **WebSocket_Broadcast**: Real-time data transmission from backend to frontend clients via Socket.io
- **MongoDB_Store**: Database storage for persisted train data
- **Frontend_Dashboard**: React-based user interface displaying train information
- **API_Key**: Authentication credential for accessing RailRadar_API (stored in environment variables)
- **Error_State**: System condition when API requests fail due to network issues, rate limits, or invalid responses

## Requirements

### Requirement 1: API Service Configuration

**User Story:** As a system administrator, I want to configure the RailRadar API credentials securely, so that the system can authenticate with the external API without exposing sensitive information.

#### Acceptance Criteria

1. THE API_Service SHALL store the API_Key in environment variables
2. WHEN the API_Service starts, THE API_Service SHALL validate that the API_Key is present
3. IF the API_Key is missing, THEN THE API_Service SHALL log an error and prevent API requests
4. THE API_Service SHALL use the base URL https://api.railradar.org/api/v1 for all requests
5. WHEN making API requests, THE API_Service SHALL include the API_Key in the X-API-Key header

### Requirement 2: Real-Time Data Fetching

**User Story:** As a railway operator, I want the system to fetch live train data from RailRadar API, so that I can monitor actual train positions and statuses instead of simulated data.

#### Acceptance Criteria

1. WHEN the API_Service is running, THE API_Service SHALL fetch train data from the /trains endpoint at regular intervals
2. THE API_Service SHALL set the Polling_Interval between 30 and 60 seconds to respect Rate_Limit constraints
3. WHEN fetching train data, THE API_Service SHALL request all available trains in a single API call
4. WHEN API response is received, THE API_Service SHALL parse the JSON response into Train_Data objects
5. IF a specific train requires detailed information, THEN THE API_Service SHALL fetch from /trains/:id endpoint

### Requirement 3: Data Persistence

**User Story:** As a developer, I want fetched train data to be stored in MongoDB, so that the system maintains a persistent record and can serve data even during API outages.

#### Acceptance Criteria

1. WHEN Train_Data is received from RailRadar_API, THE API_Service SHALL update or create corresponding records in MongoDB_Store
2. THE API_Service SHALL update the lastUpdated timestamp for each Train_Data record
3. WHEN updating existing train records, THE API_Service SHALL preserve the MongoDB document _id
4. THE API_Service SHALL store latitude, longitude, status, delay, trainId, name, type, and priority fields
5. IF a train exists in MongoDB_Store but not in the API response, THEN THE API_Service SHALL mark it as inactive or remove it

### Requirement 4: Real-Time Frontend Updates

**User Story:** As a railway operator, I want the dashboard to display live train updates automatically, so that I can monitor train movements without manually refreshing the page.

#### Acceptance Criteria

1. WHEN Train_Data is updated in MongoDB_Store, THE API_Service SHALL broadcast the updated data via WebSocket_Broadcast
2. THE WebSocket_Broadcast SHALL send complete train information including position, status, and delay
3. WHEN Frontend_Dashboard receives WebSocket_Broadcast, THE Frontend_Dashboard SHALL update the displayed train information
4. THE Frontend_Dashboard SHALL maintain existing WebSocket listeners without requiring code changes
5. THE WebSocket_Broadcast SHALL occur immediately after MongoDB_Store updates complete

### Requirement 5: Rate Limit Management

**User Story:** As a system administrator, I want the system to respect API rate limits, so that we stay within the free tier quota and avoid service interruptions.

#### Acceptance Criteria

1. THE API_Service SHALL limit requests to a maximum of 1,000 per month
2. THE API_Service SHALL track the number of API requests made within the current month
3. WHEN the request count approaches 90% of Rate_Limit, THE API_Service SHALL log a warning
4. IF Rate_Limit is reached, THEN THE API_Service SHALL stop making new requests until the next month
5. THE API_Service SHALL calculate optimal Polling_Interval based on remaining quota and days left in month

### Requirement 6: Error Handling and Resilience

**User Story:** As a railway operator, I want the system to handle API failures gracefully, so that temporary issues don't crash the application or disrupt monitoring.

#### Acceptance Criteria

1. WHEN an API request fails due to network errors, THE API_Service SHALL log the error and retry after the next Polling_Interval
2. IF RailRadar_API returns a 429 rate limit error, THEN THE API_Service SHALL pause requests and log the rate limit status
3. WHEN API response contains invalid or malformed data, THE API_Service SHALL log the error and skip that update cycle
4. IF RailRadar_API is unavailable, THEN THE API_Service SHALL continue serving cached data from MongoDB_Store
5. THE API_Service SHALL implement exponential backoff for consecutive failed requests
6. WHEN API requests fail, THE Frontend_Dashboard SHALL continue displaying the last known train data
7. THE API_Service SHALL log all API errors with timestamps and error details for debugging

### Requirement 7: Data Transformation and Mapping

**User Story:** As a developer, I want to map RailRadar API response fields to our existing Train model schema, so that the rest of the application works without modifications.

#### Acceptance Criteria

1. WHEN parsing API responses, THE API_Service SHALL map RailRadar_API fields to Train_Data schema fields
2. THE API_Service SHALL handle missing or null fields in API responses with default values
3. IF RailRadar_API provides additional fields not in our schema, THEN THE API_Service SHALL ignore them
4. THE API_Service SHALL convert RailRadar_API status values to our enum values (running, delayed, stopped)
5. WHEN delay information is provided, THE API_Service SHALL store it in minutes as a number

### Requirement 8: Monitoring and Logging

**User Story:** As a system administrator, I want comprehensive logging of API interactions, so that I can troubleshoot issues and monitor system health.

#### Acceptance Criteria

1. WHEN the API_Service makes a request, THE API_Service SHALL log the request timestamp and endpoint
2. WHEN an API response is received, THE API_Service SHALL log the response status code and data count
3. THE API_Service SHALL log the current Rate_Limit usage after each request
4. WHEN errors occur, THE API_Service SHALL log detailed error messages including stack traces
5. THE API_Service SHALL log successful MongoDB_Store updates with record counts

### Requirement 9: Backward Compatibility

**User Story:** As a developer, I want the existing dashboard UI to work with real API data, so that we don't need to refactor the frontend during this integration.

#### Acceptance Criteria

1. THE API_Service SHALL maintain the existing Train model schema structure
2. THE WebSocket_Broadcast SHALL use the same event name ('trainUpdate') as the mock simulation
3. THE API_Service SHALL provide data in the same format expected by Frontend_Dashboard
4. WHEN the /api/trains REST endpoint is called, THE API_Service SHALL return data from MongoDB_Store in the existing format
5. THE Frontend_Dashboard SHALL display real train data without code modifications

### Requirement 10: Configuration and Deployment

**User Story:** As a system administrator, I want to easily enable or disable the API integration, so that I can switch between mock and real data for testing purposes.

#### Acceptance Criteria

1. THE API_Service SHALL support a configuration flag to enable or disable RailRadar_API integration
2. WHEN API integration is disabled, THE API_Service SHALL fall back to the existing mock simulation
3. THE API_Service SHALL read configuration from environment variables
4. WHEN deploying, THE API_Service SHALL validate all required environment variables are present
5. THE API_Service SHALL provide clear startup logs indicating whether real or mock data is being used
