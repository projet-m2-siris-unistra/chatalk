package fr.chatalk.data

import androidx.lifecycle.LiveData
import androidx.room.*
import io.reactivex.Completable
import io.reactivex.Single

@Dao
interface UserDao {
    @Query("SELECT * FROM users")
    fun getAll(): LiveData<List<UserEntity>>

    @Query("SELECT * FROM users WHERE username = :username")
    fun findByUsername(username: String): LiveData<UserEntity>

    @Query("SELECT id FROM users WHERE username = :username")
    suspend fun getUserIdFromUsername(username: String): Int?

    @Query("SELECT * FROM users WHERE id = :id")
    fun findById(id: Int): LiveData<UserEntity>

    @Insert
    fun insert(user: UserEntity): Single<Long>

    @Insert
    fun insertAll(users: List<UserEntity>): Completable

    @Delete
    suspend fun delete(user: UserEntity)

    @Update
    fun update(user: UserEntity): Completable
}