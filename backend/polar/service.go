package polar

import (
	"context"
	"errors"
	"log"
	"os"
	"serverless-tesseract/models"
	"serverless-tesseract/utils"

	polargo "github.com/polarsource/polar-go"
	"github.com/polarsource/polar-go/models/components"
	"github.com/polarsource/polar-go/models/operations"
)

func IngestMeter(
	ctx context.Context,
	polarCustomerId string,
	pages int32,
) *components.EventsIngestResponse {
	polarAccessToken := os.Getenv("POLAR_ACCESS_TOKEN")
	env := os.Getenv("ENV")
	if polarAccessToken == "" {
		log.Fatal("POLAR_ACCESS_TOKEN is not set")
	}

	server := "production"
	if env == "development" {
		server = "sandbox"
	}

	s := polargo.New(
		polargo.WithSecurity(polarAccessToken),
		polargo.WithServer(server),
	)

	res, err := s.Events.Ingest(ctx, components.EventsIngest{
		Events: []components.Events{
			components.CreateEventsEventCreateCustomer(
				components.EventCreateCustomer{
					Name:       "pages",
					CustomerID: polarCustomerId,
					Metadata: map[string]components.EventCreateCustomerMetadata{
						"pages": components.CreateEventCreateCustomerMetadataInteger(int64(pages)),
					},
				},
			),
		},
	})

	if err != nil {
		log.Fatal(err)
	}

	return res.EventsIngestResponse
}

func CanUserUseOCR(
	ctx context.Context,
	organization models.Organization,
) (bool, error) {
	polarAccessToken := os.Getenv("POLAR_ACCESS_TOKEN")
	env := os.Getenv("ENV")
	if polarAccessToken == "" {
		log.Fatal("POLAR_ACCESS_TOKEN is not set")
	}

	server := "production"
	if env == "development" {
		server = "sandbox"
	}

	s := polargo.New(
		polargo.WithSecurity(polarAccessToken),
		polargo.WithServer(server),
	)

	res, err := s.Customers.Get(ctx, organization.PolarCustomerId)
	if err != nil || res.Customer == nil {
		return false, errors.New("customer not found")
	}

	// get subscription
	ocrServiceId := os.Getenv("POLAR_OCR_SERVICE_ID")
	if ocrServiceId == "" {
		return false, errors.New("POLAR_OCR_SERVICE_ID is not set")
	}

	meterId := os.Getenv("POLAR_OCR_METER_ID")
	if meterId == "" {
		return false, errors.New("POLAR_OCR_METER_ID is not set")
	}

	subscription, err := s.Subscriptions.List(
		ctx,
		operations.SubscriptionsListRequest{
			ProductID:  &operations.ProductIDFilter{Str: &ocrServiceId},
			CustomerID: &operations.CustomerIDFilter{Str: &res.Customer.ID},
			Active:     &[]bool{true}[0],
		},
	)

	if err != nil {
		return false, err
	}

	// if there is a subscription, return true
	if len(subscription.ListResourceSubscription.Items) > 0 {
		// check if at least one subscription is active
		for _, subscription := range subscription.ListResourceSubscription.Items {
			if subscription.Status == "active" {
				return true, nil
			}
		}
	}

	// if there is no subscription, check polar's meter to determine if they're over 100 pages
	// if there is no meter, that means this is their first request and we should return true
	meter, err := s.CustomerMeters.List(
		ctx,
		operations.CustomerMetersListRequest{
			CustomerID: &operations.CustomerMetersListQueryParamCustomerIDFilter{Str: &res.Customer.ID},
			MeterID:    &operations.QueryParamMeterIDFilter{Str: &meterId},
		},
	)

	if err != nil || meter == nil {
		return false, errors.New("unable to retrieving customer meter")
	}

	if len(meter.ListResourceCustomerMeter.Items) == 0 {
		return true, nil
	}

	firstMeter := meter.ListResourceCustomerMeter.Items[0]
	// since free users get 100 pages and polar does not credit free customers
	// with the free pages they need to be hard coded
	if firstMeter.ConsumedUnits >= float64(utils.POLAR_FREE_PAGE_LIMIT) {
		return false, errors.New("customer has used up their free pages")
	}

	return true, nil
}
