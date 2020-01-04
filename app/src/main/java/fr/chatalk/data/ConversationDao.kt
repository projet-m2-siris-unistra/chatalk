package fr.chatalk.data

import androidx.lifecycle.LiveData
import androidx.room.*
import io.reactivex.Completable
import io.reactivex.Single

@Dao
interface ConversationDao {
    @Query("SELECT * FROM conversations")
    fun getAll(): LiveData<List<ConversationEntity>>

    @Query("SELECT * FROM conversations WHERE id = :id")
    fun findByConversation(id: Int): LiveData<ConversationEntity>

    @Query("SELECT * FROM conversations WHERE id = :id")
    fun findById(id: Int): LiveData<ConversationEntity>

    @Insert
    fun insert(conversation: ConversationEntity): Single<Long>

    @Insert
    fun insertAll(conversations: List<ConversationEntity>): Completable

    @Delete
    suspend fun delete(conversation: ConversationEntity)

    @Update
    fun update(conversation: ConversationEntity): Completable
}