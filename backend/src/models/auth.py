from pydantic import BaseModel, field_validator


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    password: str
    full_name: str

    @field_validator("username")
    @classmethod
    def username_valid(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("اسم المستخدم يجب أن يكون 3 أحرف على الأقل")
        return v

    @field_validator("password")
    @classmethod
    def password_valid(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("كلمة المرور يجب أن تكون 6 أحرف على الأقل")
        return v


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    username: str
    full_name: str
    role: str
    is_active: bool

    model_config = {"from_attributes": True}


class CreateUserRequest(BaseModel):
    full_name: str
    username: str
    password: str
    role: str = "data_entry"
    is_active: bool = True

    @field_validator("username")
    @classmethod
    def username_valid(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("اسم المستخدم يجب أن يكون 3 أحرف على الأقل")
        return v

    @field_validator("password")
    @classmethod
    def password_valid(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("كلمة المرور يجب أن تكون 6 أحرف على الأقل")
        return v

    @field_validator("role")
    @classmethod
    def role_valid(cls, v: str) -> str:
        if v not in ("admin", "data_entry", "reports"):
            raise ValueError("الدور يجب أن يكون admin أو data_entry أو reports")
        return v


class UpdateUserRequest(BaseModel):
    full_name: str | None = None
    username: str | None = None
    password: str | None = None
    role: str | None = None
    is_active: bool | None = None

    @field_validator("role")
    @classmethod
    def role_valid(cls, v: str | None) -> str | None:
        if v is not None and v not in ("admin", "data_entry", "reports"):
            raise ValueError("الدور يجب أن يكون admin أو data_entry أو reports")
        return v

    @field_validator("username")
    @classmethod
    def username_valid(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip()
            if len(v) < 3:
                raise ValueError("اسم المستخدم يجب أن يكون 3 أحرف على الأقل")
        return v

    @field_validator("password")
    @classmethod
    def password_valid(cls, v: str | None) -> str | None:
        if v is not None and len(v) < 6:
            raise ValueError("كلمة المرور يجب أن تكون 6 أحرف على الأقل")
        return v
