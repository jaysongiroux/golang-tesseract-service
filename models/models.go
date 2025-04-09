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
