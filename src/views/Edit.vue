<script setup lang="ts">
  import type { TodoList } from "@/types";
  import { ref, watch, nextTick } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  const route = useRoute();
  const router = useRouter();
  const paramId = route.params.id;
  const todos = JSON.parse(localStorage.getItem('todos')!);
  const currentTodo = todos.filter((el:TodoList) => {
    return el.id === paramId
  })['0']
  const typedText = ref<string | ''>(currentTodo.title || '');
  const checkBox = ref<boolean>(currentTodo.isComplete || false);
  const placeholder_text_maxlength = ref(15);

  const goToMain = () => {
    router.go(-1)
  }

  const deleteItem = () => {
    let updatedTodo = todos.filter((el:TodoList) => el.id !== paramId)
    localStorage.setItem('todos', JSON.stringify(updatedTodo));
    nextTick().then(() => {
      goToMain()
    });
  }

  watch([typedText, checkBox], () => {
    let newTodo = todos.map((el:TodoList) => {
      if(el.id === paramId) {
        el.title = typedText.value
        el.isComplete = checkBox.value
      }
      return el
    })
    localStorage.setItem('todos', JSON.stringify(newTodo));
  })
</script>

<template>
  <div class="edit">
    <RouterLink class="back" to="" @click="goToMain">< Back</RouterLink>
    <div class="edit-block">
      <div class="edit-block__checkbox">
        <input type="checkbox" v-model="checkBox">
      </div>
      <div class="edit-block__title">
        <input type="text" :maxlength="placeholder_text_maxlength" v-model="typedText">
      </div>
      <div class="edit-block__data">
        <p>Created at: {{ currentTodo.date }}</p>
      </div>
      <div class="edit-block__delete" @click="deleteItem">
        Delete
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .edit {
    width: 350px;
    margin: 40px auto 0;
  }
  .back {
    font-weight: 700;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.2);
    margin-bottom: 56px;
    display: block;
  }
  .edit-block {
    &__checkbox {
      margin-bottom: 10px;
      & input {
        -webkit-appearance: none;
        appearance: none;
        background-color: #fff;
        margin-right: 15px;
        color: black;
        width: 25px;
        height: 25px;
        border: 3px solid black;
        border-radius: 0.15em;
        transform: translateY(-0.075em);
        cursor: pointer;
        &:before {
          content: '';
          left: 50%;
          top: 50%;
          width: 5px;
          height: 10px;
          border: solid white;
          border-width: 0 3px 3px 0;
          -webkit-transform: rotate(45deg);
          -ms-transform: rotate(45deg);
          transform: rotate(45deg);
          opacity: 0;
          transition: opacity .1s;
          display: flex;
          position: absolute;
          transform: translate(-50%, -70%) rotate(45deg);
        }
        &:checked {
          border-color: black;
          background-color: black;
          &:before {
            opacity: 1;
          }
        }
      }
    }
    &__title {
      margin-bottom: 50px;
      font-weight: 700;
      font-size: 40px;
      color: rgba(0, 0, 0, 1);
      & input {
        width: 100%;
        border: none;
        outline: none;
      }
    }
    &__data {
      font-weight: 700;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.2)
    }
    &__delete {
      margin-bottom: 14px;
      color: rgba(231, 64, 64, 1);
      font-size: 14px;
      text-decoration: underline;
      cursor: pointer;
    }
  }
</style>
