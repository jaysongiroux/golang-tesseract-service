package models

import (
	"time"
)

type UserRole string
type OrganizationMemberRole string

const (
	RoleAdmin UserRole = "ADMIN"
	RoleUser  UserRole = "USER"

	OrgRoleMember OrganizationMemberRole = "MEMBER"
	OrgRoleAdmin  OrganizationMemberRole = "ADMIN"
	OrgRoleOwner  OrganizationMemberRole = "OWNER"
)

type OCREngine string

const (
	OCREngineTesseract OCREngine = "tesseract"
)

type User struct {
	ID           int64     `gorm:"primaryKey;autoIncrement"`
	FirstName    string    `gorm:"not null"`
	LastName     string    `gorm:"not null"`
	Email        string    `gorm:"uniqueIndex;not null"`
	Role         UserRole  `gorm:"type:varchar(50);default:'USER'"`
	PasswordHash string    `gorm:"not null"`
	CreatedAt    time.Time `gorm:"autoCreateTime"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime"`
}

type Organization struct {
	ID        int64     `gorm:"primaryKey;autoIncrement"`
	Name      string    `gorm:"not null"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

type OrganizationMember struct {
	UserID         int64                  `gorm:"primaryKey;not null"`
	OrganizationID int64                  `gorm:"primaryKey;not null"`
	Role           OrganizationMemberRole `gorm:"type:varchar(50);default:'MEMBER'"`
	CreatedAt      time.Time              `gorm:"autoCreateTime"`
	UpdatedAt      time.Time              `gorm:"autoUpdateTime"`
}

type OrganizationMemberAPI struct {
	UserID         int64      `json:"user_id"`
	OrganizationID int64      `json:"organization_id"`
	KeyHash        string     `json:"key_hash"`
	ExpiresAt      *time.Time `json:"expires_at"`
}

type OrganizationFileCache struct {
	Hash      string    `json:"hash"`
	CreatedAt time.Time `json:"created_at"`
	Results   string    `json:"results"`
	OCREngine string    `json:"ocr_engine"`
}

type OrganizationOCRRequest struct {
	ID         int64     `json:"id"`
	CreatedAt  time.Time `json:"created_at"`
	CacheHit   bool      `json:"cache_hit"`
	NumOfPages int32     `json:"num_of_pages"`
	OCREngine  OCREngine `json:"ocr_engine"`
}

// TableName overrides the table name
func (User) TableName() string {
	return "users"
}

func (Organization) TableName() string {
	return "organizations"
}

func (OrganizationMember) TableName() string {
	return "organization_members"
}
