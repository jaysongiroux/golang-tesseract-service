package organizationApis

import (
	"net/http"
	"serverless-tesseract/db"
	"serverless-tesseract/models"
	"serverless-tesseract/utils"

	"github.com/gin-gonic/gin"
)

func CreateOrganization(c *gin.Context) {
	// get user from context
	authed_user_id_int, err := utils.GetFormattedAuthedUserIdFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get authed user id"})
		return
	}

	org_name := c.PostForm("org_name")

	// validate first name
	if !utils.ValidateOrganizationName(org_name) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Organization Name"})
		return
	}

	// check if the user can create an organization.
	// will have to join organization_members table to get the number of organizations the user is a member of
	var organization_member_count int64
	db.DB.Model(&models.OrganizationMember{}).Where("user_id = ?", authed_user_id_int).Count(&organization_member_count)

	if organization_member_count >= int64(utils.ORG_USER_LIMIT) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User has reached the maximum number of organizations"})
		return
	}

	// create organization
	organization := models.Organization{
		Name: org_name,
	}

	result := db.DB.Create(&organization)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create organization"})
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

	c.JSON(http.StatusAccepted, gin.H{"message": "Organization created", "organization": organization, "organization_member": organization_member})
}

func GetOrganizations(c *gin.Context) {
	// get user from context
	authed_user_id_int, err := utils.GetFormattedAuthedUserIdFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get authed user id"})
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get organizations"})
		return
	}

	c.JSON(http.StatusAccepted, gin.H{"message": "Organizations fetched", "organizations": organizations})

}
