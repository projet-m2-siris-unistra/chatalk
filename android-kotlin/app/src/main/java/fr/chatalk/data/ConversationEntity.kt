package fr.chatalk.data

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.*

@Entity(tableName = "conversations")
data class ConversationEntity(
    @PrimaryKey @ColumnInfo(name = "id") val conversationId: Int = 0,
    @ColumnInfo(name = "name") val name: String,
    @ColumnInfo(name = "shared_key") val sharedKey: String,
    @ColumnInfo(name = "members") val members: String,
    @ColumnInfo(name = "created_at") val createdAt: Date = Date(System.currentTimeMillis())
)