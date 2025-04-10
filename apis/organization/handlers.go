package organizationApis

import (
	"log"
	"net/http"
	"serverless-tesseract/db"
	"serverless-tesseract/models"
	"serverless-tesseract/utils"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// CreateOrganization godoc
//
//	@Summary		Create an organization
//	@Description	create an organization with a name
//	@Tags			Organization
//	@Accept			json
//	@Produce		json
//	@Param			org_name	formData	string	true	"Organization Name"
//	@Success		200			{object}	models.Organization
//	@Failure		500			{object}	utils.ErrorResponse
//	@Failure		400			{object}	utils.ErrorResponse
//	@Router			/api/organization [post]
func CreateOrganization(c *gin.Context) {
	org_name := c.PostForm("org_name")

	// get user from context
	authed_user_id_int, err := utils.GetFormattedAuthedUserIdFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: "Failed to get authed user id"})
		return
	}

	// validate first name
	if !utils.ValidateOrganizationName(org_name) {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse{Error: "Invalid Organization Name"})
		return
	}

	// check if the user can create an organization.
	// will have to join organization_members table to get the number of organizations the user is a member of
	var organization_member_count int64
	db.DB.Model(&models.OrganizationMember{}).Where("user_id = ?", authed_user_id_int).Count(&organization_member_count)

	if organization_member_count >= int64(utils.ORG_USER_LIMIT) {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse{Error: "User has reached the maximum number of organizations"})
		return
	}

	// create organization
	organization := models.Organization{
		Name: org_name,
	}

	result := db.DB.Create(&organization)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: "Failed to create organization"})
		return
	}

	organization_member := models.OrganizationMember{
		UserID:         *authed_user_id_int,
		OrganizationID: organization.ID,
		Role:           models.OrgRoleAdmin,
	}

	org_member := db.DB.Create(&organization_member)

	if org_member.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create organization member"})
		return
	}

	c.JSON(http.StatusAccepted, organization)
}

// GetOrganizations godoc
//
//	@Summary		Get all organizations for the authenticated user
//	@Description	get all organizations for the authenticated user
//	@Tags			Organization
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	[]models.Organization
//	@Failure		500	{object}	utils.ErrorResponse
//	@Failure		400	{object}	utils.ErrorResponse
//	@Router			/api/organization [get]
func GetOrganizations(c *gin.Context) {
	// get user from context
	authed_user_id_int, err := utils.GetFormattedAuthedUserIdFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: "Failed to get authed user id"})
		return
	}

	// get a list of organizations and the authed groupMember where the authed user is a member
	var organizations []models.Organization
	resErr := db.DB.Table("organization_members").
		Select("organizations.*").
		Joins("join organizations on organizations.id = organization_members.organization_id").
		Where("organization_members.user_id = ?", authed_user_id_int).
		Scan(&organizations).
		Order("organizations.created_at DESC").
		Error

	if resErr != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: "Failed to get organizations"})
		return
	}

	c.JSON(http.StatusAccepted, gin.H{"organizations": organizations})
}

// GetOrganizationMembers godoc
//
//	@Summary		Get all members of an organization
//	@Description	get all members of an organization
//	@Tags			Organization Members
//	@Accept			json
//	@Produce		json
//	@Param			organization_id	path		string	true	"Organization ID"
//	@Success		200				{object}	[]models.OrganizationMember
//	@Failure		500				{object}	utils.ErrorResponse
//	@Failure		400				{object}	utils.ErrorResponse
//	@Router			/api/organization/:organization_id/members [get]
func GetOrganizationMembers(c *gin.Context) {
	// get user from context
	authed_user_id_int, err := utils.GetFormattedAuthedUserIdFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: "Failed to get authed user id"})
		return
	}

	// check if the authed user is an admin of the organization
	var organization_member models.OrganizationMember
	db.DB.Where("user_id = ? AND organization_id = ? AND role = ?", authed_user_id_int, c.Param("organization_id"), models.OrgRoleAdmin).First(&organization_member)

	if organization_member.Role != models.OrgRoleAdmin &&
		organization_member.Role != models.OrgRoleOwner &&
		organization_member.Role != models.OrgRoleMember {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse{Error: "User is not an admin of the organization"})
		return
	}

	// get the organization id from the url
	organization_id := c.Param("organization_id")

	// get the members of the organization and join with the users table
	var organization_members []models.OrganizationMember
	resErr := db.DB.Table("organization_members").
		Select("organization_members.*").
		Joins("join users on users.id = organization_members.user_id").
		Where("organization_members.organization_id = ?", organization_id).
		Scan(&organization_members).
		Error

	if resErr != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: "Failed to get organization members"})
		return
	}

	c.JSON(http.StatusAccepted, organization_members)
}

// GetOrganization godoc
//
//	@Summary		Get an organization
//	@Description	get an organization
//	@Tags			Organization
//	@Accept			json
//	@Produce		json
//	@Param			organization_id	path		string	true	"Organization ID"
//	@Success		200				{object}	models.Organization
//	@Failure		500				{object}	utils.ErrorResponse
//	@Failure		400				{object}	utils.ErrorResponse
//	@Router			/api/organization/:organization_id [get]
func GetOrganization(c *gin.Context) {
	// get user from context
	organization_id := c.Param("organization_id")

	organization_id_int, err := strconv.ParseInt(organization_id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse{Error: "Invalid organization id"})
		return
	}

	authed_user_id_int, err := utils.GetFormattedAuthedUserIdFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: "Failed to get authed user id"})
		return
	}

	// check if the authed user is a member of the organization
	var organization_member models.OrganizationMember
	db.DB.Where("user_id = ? AND organization_id = ?", authed_user_id_int, organization_id_int).First(&organization_member)

	// if there is no organization member, return unauthorized
	if organization_member.UserID != *authed_user_id_int {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse{Error: "User is not a member of the organization"})
		return
	}

	// get the organization
	var organization models.Organization
	db.DB.Where("id = ?", organization_id_int).First(&organization)

	if organization.ID != organization_id_int {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse{Error: "Organization not found"})
		return
	}

	c.JSON(http.StatusAccepted, gin.H{"organization": organization})
}

// CreateOrganizationMemberAPI godoc
//
//	@Summary		Create an API key for the authenticated user
//	@Description	create an API key for the authenticated user
//	@Tags			Organization Member
//	@Accept			json
//	@Produce		json
//	@Param			organization_id	path		string	true	"Organization ID"
//	@Success		200				{object}	utils.APITokenResponse
//	@Failure		500				{object}	utils.ErrorResponse
//	@Failure		400				{object}	utils.ErrorResponse
//	@Router			/api/organization/:organization_id/api-key [post]
func CreateOrganizationMemberAPI(c *gin.Context) {
	// get user from context
	authed_user_id_int, err := utils.GetFormattedAuthedUserIdFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: "Failed to get authed user id"})
		return
	}

	organization_id := c.Param("organization_id")

	// check if the authed user is an admin of the organization
	var organization_member models.OrganizationMember
	db.DB.Where("user_id = ? AND organization_id = ? AND role = ?", authed_user_id_int, organization_id, models.OrgRoleAdmin).First(&organization_member)

	if organization_member.Role != models.OrgRoleAdmin {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse{Error: "User is not an admin of the organization"})
		return
	}

	organization_id_int, err := strconv.ParseInt(organization_id, 10, 64)
	if err != nil {
		log.Printf("Failed to parse organization id: %v", err)
		c.JSON(http.StatusBadRequest, utils.ErrorResponse{Error: "Invalid organization id"})
		return
	}

	expiration_time_offset_hours := c.PostForm("expiration_time")
	var expiration_time_Time *time.Time

	// Only parse expiration time if it's provided
	if expiration_time_offset_hours != "" {
		expiration_time_offset_hours_int, err := strconv.Atoi(expiration_time_offset_hours)
		if err != nil {
			log.Printf("Failed to parse expiration time offset hours: %v", err)
			c.JSON(http.StatusBadRequest, utils.ErrorResponse{Error: "Invalid expiration time offset hours"})
			return
		}

		expiration_time := time.Now().Add(time.Duration(expiration_time_offset_hours_int) * time.Hour)
		expiration_time_Time = &expiration_time
	}

	api_key, api_key_hash, err := utils.GenerateAPIKey(
		authed_user_id_int,
		&organization_id_int,
		expiration_time_Time,
	)

	if err != nil {
		log.Printf("Failed to generate API key: %v", err)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: "Failed to generate API key"})
		return
	}

	// upsert the api key hash into the database using the userId and organizationId as keys
	organizationMemberAPI := models.OrganizationMemberAPI{
		UserID:         *authed_user_id_int,
		OrganizationID: organization_id_int,
		KeyHash:        api_key_hash,
		ExpiresAt:      expiration_time_Time,
	}

	// Use FirstOrCreate to find existing record or create a new one
	result := db.DB.Where("user_id = ? AND organization_id = ?",
		*authed_user_id_int, organization_id_int).
		Assign(models.OrganizationMemberAPI{
			KeyHash:   api_key_hash,
			ExpiresAt: expiration_time_Time,
		}).
		FirstOrCreate(&organizationMemberAPI)

	if result.Error != nil {
		log.Printf("Failed to save API key: %v", result.Error)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: "Failed to save API key"})
		return
	}

	c.JSON(http.StatusAccepted, utils.APITokenResponse{Token: api_key})
}
