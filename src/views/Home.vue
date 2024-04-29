<script setup lang="ts">
  import type { TodoList } from "@/types";
  import { ref, watch, computed, onMounted, nextTick, onUpdated } from 'vue'
  import { v4 as uuidv4 } from 'uuid'
  import moment from 'moment';
  import draggable from 'vuedraggable'
  import MdiLightSettings from '../components/icons/MdiLightSettings.vue';

  const todos = ref(JSON.parse(localStorage.getItem('todos')!) || [
    {
      id: uuidv4(),
      title: 'First ToDo',
      isComplete: false,
      date: moment().format("D.M.YY H:m")
    },
    {
      id: uuidv4(),
      title: 'Second ToDo',
      isComplete: false,
      date: moment().format("D.M.YY H:m")
    },
    {
      id: uuidv4(),
      title: 'Done ToDo',
      isComplete: true,
      date: moment().format("D.M.YY H:m")
    }]
  )
  const radioSwitcher = ref([
    { title: 'all'},
    { title: 'completed' },
    { title: 'ongoing' }
  ])
  const dragOptions = ref({
    animation: 200,
    group: "description",
    disabled: false,
    ghostClass: "ghost"
  })
  const myTodo = ref<HTMLDivElement | null>(null);
  const currentFilter = ref<string | ''>(radioSwitcher.value[0].title);
  const drag = ref<boolean>(false);
  const placeholder_text = ref<string | ''>('');
  const placeholder_text_maxlength = ref(15);
  const moveToBottom = () => {
    const list = myTodo.value!;
    list.scrollIntoView({
      block: 'end',
      behavior: 'smooth',
    });
  }

  const deleteItem = (id:string) => {
    todos.value = todos.value.filter((el:TodoList) => el.id !== id)
  }

  const addItem = () => {
    if(placeholder_text.value.trim() === '') return
    todos.value.push({
      id: uuidv4(),
      title: placeholder_text.value,
      isComplete: false,
      date: moment().format("D.M.YY H:mm")
    })
    nextTick()
      .then(() => {
        placeholder_text.value = '';
        moveToBottom();
        currentFilter.value = radioSwitcher.value[0].title
      });
  }

  const filteredTodo = computed(() => {
    if(currentFilter.value === 'completed') {
      return todos.value.filter((el:TodoList) => el.isComplete !== false)
    } else if(currentFilter.value === 'ongoing') {
      return todos.value.filter((el:TodoList) => el.isComplete !== true)
    } else {
      return todos.value
    }
  })

  watch(todos, (todosValue) => {
    localStorage.setItem('todos', JSON.stringify(todosValue));
  },
  {
    deep:true,
    immediate: true
  })

  onMounted(() => {
    todos.value = JSON.parse(localStorage.getItem('todos') || '[]');
    moveToBottom();
  })
</script>

<template>
  <div class="todo" :class="'filter-' + currentFilter" ref="myTodo">
    <div class="logo">
      <img src="/logo.svg" alt="logo">
    </div>
    <div class="radio-block">
      <ul>
        <li v-for="item in radioSwitcher">
          <div class="radio-block__item">
            <input
              type="radio"
              :id="item.title"
              name="radio-group"
              :value="item.title"
              v-model="currentFilter"
              />
            <label :for="item.title">{{ item.title }}</label>
          </div>
        </li>
      </ul>
    </div>
    <div class="list-wrapper">
      <draggable 
        :list="filteredTodo" 
        @start="drag=true" 
        @end="drag=false" 
        class="list"
        v-bind="dragOptions"
        :component-data="{
          type: 'transition-group',
          name: !drag ? 'flip-list' : null
        }"
        item-key="id"
        v-if="filteredTodo.length">
          <template #item="{element}">
            <div class="list-block" :class="{'disable': element.isComplete}">
              <div class="list-block__checked">
                <input type="checkbox" v-model="element.isComplete" :id="element.id">
                <label :for="element.id">{{ element.title }}</label>
              </div>
              <div class="list-block__settings">
                <div class="list-block__edit">
                  <RouterLink :to="{ path: '/edit/' + element.id }"><MdiLightSettings/></RouterLink>
                </div>
                <div class="list-block__delete" @click="deleteItem(element.id)">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.5 3H10.5V2.25C10.5 1.91848 10.3683 1.60054 10.1339 1.36612C9.89946 1.1317 9.58152 1 9.25 1H6.75C6.41848 1 6.10054 1.1317 5.86612 1.36612C5.6317 1.60054 5.5 1.91848 5.5 2.25V3H2.5C2.36739 3 2.24021 3.05268 2.14645 3.14645C2.05268 3.24021 2 3.36739 2 3.5C2 3.63261 2.05268 3.75979 2.14645 3.85355C2.24021 3.94732 2.36739 4 2.5 4H3.03125L3.625 13.5288C3.66937 14.3678 4.3125 15 5.125 15H10.875C11.6916 15 12.3219 14.3819 12.375 13.5312L12.9688 4H13.5C13.6326 4 13.7598 3.94732 13.8536 3.85355C13.9473 3.75979 14 3.63261 14 3.5C14 3.36739 13.9473 3.24021 13.8536 3.14645C13.7598 3.05268 13.6326 3 13.5 3ZM6.01781 13H6C5.87042 13.0001 5.74587 12.9499 5.6526 12.8599C5.55933 12.77 5.50462 12.6473 5.5 12.5178L5.25 5.51781C5.24528 5.3852 5.29342 5.25615 5.38385 5.15904C5.47428 5.06193 5.59958 5.00472 5.73219 5C5.8648 4.99528 5.99385 5.04342 6.09096 5.13385C6.18807 5.22428 6.24528 5.34958 6.25 5.48219L6.5 12.4822C6.50238 12.5479 6.49179 12.6134 6.46884 12.6749C6.44589 12.7365 6.41103 12.793 6.36624 12.841C6.32146 12.8891 6.26764 12.9279 6.20785 12.9552C6.14806 12.9825 6.08349 12.9977 6.01781 13ZM8.5 12.5C8.5 12.6326 8.44732 12.7598 8.35355 12.8536C8.25979 12.9473 8.13261 13 8 13C7.86739 13 7.74021 12.9473 7.64645 12.8536C7.55268 12.7598 7.5 12.6326 7.5 12.5V5.5C7.5 5.36739 7.55268 5.24021 7.64645 5.14645C7.74021 5.05268 7.86739 5 8 5C8.13261 5 8.25979 5.05268 8.35355 5.14645C8.44732 5.24021 8.5 5.36739 8.5 5.5V12.5ZM9.5 3H6.5V2.25C6.49962 2.21706 6.50583 2.18439 6.51826 2.15388C6.53069 2.12338 6.54909 2.09567 6.57238 2.07238C6.59567 2.04909 6.62338 2.03069 6.65388 2.01826C6.68439 2.00583 6.71706 1.99962 6.75 2H9.25C9.28294 1.99962 9.31561 2.00583 9.34612 2.01826C9.37662 2.03069 9.40433 2.04909 9.42762 2.07238C9.45091 2.09567 9.46931 2.12338 9.48174 2.15388C9.49417 2.18439 9.50038 2.21706 9.5 2.25V3ZM10.5 12.5178C10.4954 12.6473 10.4407 12.77 10.3474 12.8599C10.2541 12.9499 10.1296 13.0001 10 13H9.98188C9.91623 12.9977 9.85168 12.9824 9.79193 12.9551C9.73218 12.9278 9.67839 12.889 9.63364 12.8409C9.58889 12.7929 9.55406 12.7364 9.53113 12.6749C9.5082 12.6133 9.49762 12.5478 9.5 12.4822L9.75 5.48219C9.75234 5.41653 9.76759 5.35197 9.79488 5.2922C9.82217 5.23243 9.86096 5.17863 9.90904 5.13385C9.95713 5.08908 10.0136 5.05421 10.0751 5.03124C10.1367 5.00828 10.2022 4.99766 10.2678 5C10.3335 5.00234 10.398 5.01759 10.4578 5.04488C10.5176 5.07217 10.5714 5.11096 10.6161 5.15904C10.6609 5.20713 10.6958 5.26356 10.7188 5.32511C10.7417 5.38667 10.7523 5.45215 10.75 5.51781L10.5 12.5178Z" fill="black" fill-opacity="0.3"/>
                  </svg>
                </div>
              </div>
            </div>
          </template>
      </draggable>
      <div class="empty-image" v-else>
        <img src="/empty.png" alt="empty">
      </div>
    </div>
    <div class="input-block">
      <input 
          class="input-block__input" 
          v-model="placeholder_text" 
          type="text" 
          placeholder="Enter your new ToDo..."
          @keyup.enter="addItem"
          :maxlength="placeholder_text_maxlength">
      <div class="input-block__icon" @click="addItem">
        <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 2.34375C6.8999 2.34375 2.34375 6.8999 2.34375 12.5C2.34375 18.1001 6.8999 22.6562 12.5 22.6562C18.1001 22.6562 22.6562 18.1001 22.6562 12.5C22.6562 6.8999 18.1001 2.34375 12.5 2.34375ZM17.1875 13.2812H13.2812V17.1875H11.7188V13.2812H7.8125V11.7188H11.7188V7.8125H13.2812V11.7188H17.1875V13.2812Z" fill="black" fill-opacity="0.5"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .todo {
    max-width: 350px;
    margin: 0 auto;
    &.filter-all {
      & .list-block {
        &__checked {
          pointer-events: auto;
        }
      }
    }
  }
  .logo {
    width: 51px;
    height: 75px;
    margin: 0 auto 100px;
    & img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
  .list-wrapper {
    margin-top: 20px;
  }
  .list {
    padding: 0;
    padding-bottom: 100px;
    margin-bottom: 0;
    & li {
      list-style: none;
      display: flex;
      align-items: center;
      justify-content: center;
      &:not(:last-child) {
        margin-bottom: 10px;
      }
    }
  }
  .list-block {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 350px;
    height: 50px;
    padding: 12px 15px;
    box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    transition: filter .1s;
    box-sizing: border-box;

    &.disable {
      filter: opacity(0.5);
    }

    &__checked {
      display: flex;
      align-items: center;
      cursor: pointer;
      pointer-events: none;
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
      & label {
        font-size: 14px;
        font-weight: 700;
      cursor: pointer;
      }
    }

    &__settings {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    &__edit {
      & a {
        display: flex;
        align-items: center;
        justify-content: center;

        & svg {
          color: rgba(0,0,0, .6)
        }
      }
    }
    &__delete {
      margin-left: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .input-block {
    position: fixed;
    width: 350px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    bottom: 20px;
    left: 50%;
    transform: translate(-50%, 0);
    &__input {
      width: 100%;
      height: 100%;
      border-radius: 10px;
      padding: 0 10px;
      border: none;
      background-color: rgba(0,0,0, .05);
      transition: all .2s;
      &:hover,
      &:focus {
        border: none;
        outline: none;
        box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.1);
      }
    }
    &__icon {
      position: absolute;
      top: 50%;
      right: 10px;
      transform: translate(0, -50%);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      & svg {
        & path {
          transition: all .2s;
        }
      }
      &:hover {
        & svg {
          & path {
            fill-opacity: 1;
          }
        }
      }
    }
  }
  .radio-block {
    & ul {
      list-style: none;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      & li {
        &:not(:last-child) {
          margin-right: 15px;
        }
      }
    }
    &__item {
      & input {
        margin-right: 5px;
        &[type="radio"]:checked,
        &[type="radio"]:not(:checked) {
          position: absolute;
          left: -9999px;
        }
        &[type="radio"]:checked + label,
        &[type="radio"]:not(:checked) + label {
            position: relative;
            padding-left: 28px;
            cursor: pointer;
            line-height: 20px;
            display: inline-block;
            color: #666;
        }
        &[type="radio"]:checked + label,
        &[type="radio"]:not(:checked) + label {
            position: relative;
            padding-left: 28px;
            cursor: pointer;
            line-height: 20px;
            display: inline-block;
            color: #666;
        }
        &[type="radio"]:checked + label:before,
        &[type="radio"]:not(:checked) + label:before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            width: 18px;
            height: 18px;
            border: 1px solid #ddd;
            border-radius: 100%;
            background: #fff;
        }
        &[type="radio"]:checked + label:before,
        &[type="radio"]:not(:checked) + label:before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            width: 18px;
            height: 18px;
            border: 1px solid #ddd;
            border-radius: 100%;
            background: #fff;
        }
        &[type="radio"]:checked + label:after,
        &[type="radio"]:not(:checked) + label:after {
            content: '';
            width: 12px;
            height: 12px;
            background: rgba(0,0,0, 0.5);
            position: absolute;
            top: 4px;
            left: 4px;
            border-radius: 100%;
            -webkit-transition: all 0.2s ease;
            transition: all 0.2s ease;
        }
        &[type="radio"]:not(:checked) + label:after {
            opacity: 0;
            -webkit-transform: scale(0);
            transform: scale(0);
        }
        &[type="radio"]:checked + label:after {
            opacity: 1;
            -webkit-transform: scale(1);
            transform: scale(1);
        }
      }
      & label {
        text-transform: capitalize;
      }
    }
  }
  .empty-image {
    width: 100%;
    & img {
      width: 100%;
      object-fit: contain;
    }
  }
</style>
