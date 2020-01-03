package fr.chatalk.api

enum class ActionType {
    ping,
    login
}

sealed class Action(val action: ActionType)

data class LoginPayload(
    val username: String,
    val password: String
)

data class LoginRequest(
    val payload: LoginPayload
) : Action(ActionType.login)

data class LoginResponse(
    val success: Boolean,
    val error: String?,
    val userid: Int?,
    val displayname: String?,
    val picture: String?
) : Action(ActionType.login)

data class PingRequest(val payload: Map<String, String> = emptyMap()) : Action(ActionType.ping)
data class PingResponse(val payload: Map<String, String>) : Action(ActionType.ping)
