package fr.chatalk.data

import androidx.lifecycle.LiveData
import androidx.room.*
import io.reactivex.Completable
import io.reactivex.Single

@Dao
interface MessageDao {
    @Query("SELECT * FROM messages")
    fun getAll(): LiveData<List<MessageEntity>>

    @Query("SELECT * FROM messages WHERE convid = :convid")
    fun findByConversation(convid: Int): LiveData<MessageEntity>

    @Query("SELECT * FROM messages WHERE id = :id")
    fun findById(id: Int): LiveData<MessageEntity>

    @Insert
    fun insert(message: MessageEntity): Single<Long>

    @Insert
    fun insertAll(messages: List<MessageEntity>): Completable

    @Delete
    suspend fun delete(message: MessageEntity)

    @Update
    fun update(message: MessageEntity): Completable
}