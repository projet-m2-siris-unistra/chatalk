package fr.chatalk.api

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

enum class ActionType {
    ping,
    login,
    register,
    @Json(name = "send-info")
    sendInfo,
    @Json(name = "msg_sender")
    msgSender
}

sealed class Request(val action: ActionType)
sealed class Response(val action: ActionType)

@JsonClass(generateAdapter = true)
data class LoginPayload(
    val username: String? = null,
    val password: String? = null,
    val method: String? = null,
    val action: String? = null,
    val token: String? = null
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
    val username: String?,
    val displayname: String?,
    val picture: String?,
    val type: String?
) : Response(ActionType.login)

@JsonClass(generateAdapter = true)
data class RegisterPayload(
    val username: String,
    val email: String,
    val password: String,
    @Json(name = "password-confirmation") val passwordConfirmation: String
)

@JsonClass(generateAdapter = true)
data class RegisterRequest(
    val payload: RegisterPayload
) : Request(ActionType.register)

@JsonClass(generateAdapter = true)
data class RegisterResponse(
    val success: Boolean,
    val error: String?
) : Response(ActionType.register)

@JsonClass(generateAdapter = true)
data class MsgSenderRequest(
    val source: String,
    val destination: String,
    val device: String,
    val payload: String,
    val type: String
) : Request(ActionType.msgSender)

@JsonClass(generateAdapter = true)
data class MsgSenderResponse(
    val msgid: Int?,
    val source: Int?,
    val destination: Int?,
    val device: Int?,
    val payload: String,
    val type: String?
) : Response(ActionType.msgSender)

data class InfosUser(
    val userid: Int?,
    val username: String?,
    val displayname: String?,
    val picture: String?
)

data class InfosConv(
    val convid: Int?,
    val convname: String?,
    @Json(name = "shared_key") val sharedKey: String?,
    val members: String?
)

data class InfosMessage(
    val msgid: Int?,
    val senderid: Int?,
    val convid: Int?,
    val content: String?
)

@JsonClass(generateAdapter = true)
data class SendInfosResponse(
    val success: Boolean,
    val error: String?,
    val users: List<InfosUser>,
    val convs: List<InfosConv>,
    val messages: List<InfosMessage>
) : Response(ActionType.sendInfo)

@JsonClass(generateAdapter = true)
data class PingRequest(val payload: Map<String, String> = emptyMap()) : Request(ActionType.ping)

@JsonClass(generateAdapter = true)
data class PingResponse(
    @Json(name = "ws-id") val wsId: String?,
    val payload: Map<String, String>
) : Response(ActionType.ping)
