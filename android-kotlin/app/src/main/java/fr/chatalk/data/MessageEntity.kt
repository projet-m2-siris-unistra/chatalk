package fr.chatalk.data

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.*

@Entity(tableName = "messages")
data class MessageEntity(
    @PrimaryKey @ColumnInfo(name = "id") val messageId: Int = 0,
    @ColumnInfo(name = "senderid") val senderid: Int,
    @ColumnInfo(name = "convid") val convid: Int,
    @ColumnInfo(name = "content") val content: String,
    @ColumnInfo(name = "created_at") val createdAt: Date = Date(System.currentTimeMillis())
)