package com.prince.journalApp.service;

import com.prince.journalApp.entity.JournalEntry;
import com.prince.journalApp.entity.User;
import com.prince.journalApp.repository.JournalEntryRepository;
import com.prince.journalApp.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JournalEntryRepository journalEntryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public boolean saveNewUser(User user){
        try {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            if (user.getRoles() == null || user.getRoles().isEmpty()) {
                user.setRoles(Arrays.asList("USER"));
            }
            userRepository.save(user);
            return true;
        } catch (Exception e) {
            log.error("Error occurred while saving user {}: {}", user.getUserName(), e.getMessage());
            return false;
        }
    }

    public void saveUser(User user){
        userRepository.save(user);
    }

    public void saveEntry(User user){
        saveUser(user);
    }

    public List<User> getAll(){
        return userRepository.findAll();
    }

    public Optional<User> findById(ObjectId id){
        return userRepository.findById(id);
    }

    public User findByUserName(String userName){
        return userRepository.findByUserName(userName);
    }

    public void deleteById(ObjectId id){
        userRepository.deleteById(id);
    }

    public void deleteByUserName(String userName){
        User user = userRepository.findByUserName(userName);
        if (user != null) {
            for (JournalEntry entry : user.getJournalEntries()) {
                journalEntryRepository.deleteById(entry.getId());
            }
            userRepository.deleteByUserName(userName);
        }
    }
}
