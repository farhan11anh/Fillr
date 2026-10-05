<script setup>
import { ref, computed } from 'vue'

const nativeSelect = ref('')
const nativeMultiple = ref([])

const qSelect = ref('')
const qSelectMultiple = ref([])

const options = ['Indonesia', 'Malaysia', 'Singapore', 'Thailand', 'Vietnam']

// Async options
const asyncOptions = ref([])
const qSelectAsync = ref('')
const loadAsync = () => {
  setTimeout(() => {
    asyncOptions.value = ['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Makassar']
  }, 1000)
}

// Dependent options
const provinces = ['Jawa Barat', 'Jawa Tengah', 'Jawa Timur']
const citiesMap = {
  'Jawa Barat': ['Bandung', 'Bogor', 'Depok'],
  'Jawa Tengah': ['Semarang', 'Solo', 'Magelang'],
  'Jawa Timur': ['Surabaya', 'Malang', 'Kediri']
}

const selectedProvince = ref('')
const selectedCity = ref('')
const cityOptions = computed(() => {
  return selectedProvince.value ? citiesMap[selectedProvince.value] : []
})

const randomId = ref('')
const randomQSelect = ref('')
const noLabelQSelect = ref('')
import { onMounted } from 'vue'

const filterOptions = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry']
const qSelectUseInput = ref('')
const qSelectUseInputOptions = ref(filterOptions)
const filterFn = (val, update) => {
  if (val === '') {
    update(() => {
      qSelectUseInputOptions.value = filterOptions
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    qSelectUseInputOptions.value = filterOptions.filter(v => v.toLowerCase().indexOf(needle) > -1)
  })
}

const randomIdInput = ref('')
const randomQInput = ref('')

const emitValueSelect = ref('')
const emitValueOptions = [
  { label: 'Jakarta', value: 'JKT' },
  { label: 'Bandung', value: 'BDO' },
  { label: 'Surabaya', value: 'SUB' },
]

onMounted(() => {
  randomId.value = 'f_' + crypto.randomUUID()
  randomIdInput.value = 'f_' + crypto.randomUUID()
})

</script>

<template>
  <div class="q-pa-md">
    <h4>Dropdown Playground</h4>

    <div class="q-gutter-y-md column" style="max-width: 300px">
      <div>
        <label>Native Select (Single)</label>
        <select v-model="nativeSelect" id="native-single" style="width:100%; padding:8px;">
          <option value="" disabled>Select Country</option>
          <option value="ID">Indonesia</option>
          <option value="MY">Malaysia</option>
          <option value="SG">Singapore</option>
        </select>
      </div>

      <div>
        <label>Native Select (Multiple)</label>
        <select v-model="nativeMultiple" id="native-multiple" multiple style="width:100%; padding:8px;">
          <option value="ID">Indonesia</option>
          <option value="MY">Malaysia</option>
          <option value="SG">Singapore</option>
        </select>
      </div>

      <q-select v-model="qSelect" :options="options" label="Q-Select (Single)" />

      <q-select v-model="qSelectMultiple" multiple :options="options" use-chips label="Q-Select (Multiple)" />

      <q-select v-model="qSelectAsync" :options="asyncOptions" @popup-show="loadAsync" label="Q-Select (Async)" />

      <q-select v-model="selectedProvince" :options="provinces" label="Provinsi" />
      <q-select v-model="selectedCity" :options="cityOptions" :disable="!selectedProvince" label="Kota" />
      
      <div class="row">
        <div class="form-label-responsive">
          <b>Rumah Sakit Asal</b>
        </div>
        <div class="form-control">
          <q-select :id="randomId" v-model="randomQSelect" :options="['RS A', 'RS B', 'RS C']" />
        </div>
      </div>
      
      <div class="row">
        <div class="form-label-responsive">
          <b>Nama Pasien</b>
        </div>
        <div class="form-control">
          <q-input :id="randomIdInput" v-model="randomQInput" />
        </div>
      </div>

      <div>
        <label for="use-input-select">Select Buah</label>
        <q-select id="use-input-select" v-model="qSelectUseInput" use-input :options="qSelectUseInputOptions" @filter="filterFn" />
      </div>

      <div>
         <span>No Label Q-Select context</span>
         <q-select v-model="noLabelQSelect" :options="['X', 'Y', 'Z']" />
      </div>

      <div>
        <label>Q-Select Emit Value + Map Options</label>
        <q-select v-model="emitValueSelect" :options="emitValueOptions" emit-value map-options />
      </div>
    </div>
  </div>
</template>
