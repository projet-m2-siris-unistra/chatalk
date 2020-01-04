package fr.chatalk.api

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

enum class ActionType {
    ping,
    login
}

sealed class Request(val action: ActionType)
sealed class Response(val action: ActionType)

@JsonClass(generateAdapter = true)
data class LoginPayload(
    val username: String,
    val password: String
)

@JsonClass(generateAdapter = true)
data class LoginRequest(
    val payload: LoginPayload
) : Request(ActionType.login)

@JsonClass(generateAdapter = true)
data class LoginResponse(
    val success: Boolean,
    val error: String?,
    val token: String?,
    val userid: Int?,
    val displayname: String?,
    val picture: String?
) : Response(ActionType.login)

@JsonClass(generateAdapter = true)
data class PingRequest(val payload: Map<String, String> = emptyMap()) : Request(ActionType.ping)

@JsonClass(generateAdapter = true)
data class PingResponse(
    @Json(name = "ws-id") val wsId: String?,
    val payload: Map<String, String>
) : Response(ActionType.ping)
