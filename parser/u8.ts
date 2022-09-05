class U8 {
  value: number | number[]

  type: 'number' | 'array'

  constructor(val: number | number[], length?: number) {
    this.value = length ? Array(length).fill(0) : val
    this.type = Array.isArray(val) ? 'array' : 'number'
  }

  unshift(val: number) {
    if (Array.isArray(this.value)) {
      this.value.unshift(val)
    } else {
      this.value = [val, this.value]
      this.type = 'array'
    }
  }

  getValue(indexes: number | number[]) {
    if (Array.isArray(this.value)) {
      if (Array.isArray(indexes)) {
        return new U8(indexes.map(i => {
          
          return (this.value as number[])[this.getRealIndex(i)]
        }))
      }
      return new U8(this.value[this.getRealIndex(indexes)])
    }
  }

  setValue(indexes: number | number[], val: number) {
    const indexList = Array.isArray(indexes) ? indexes : [indexes]
    if (Array.isArray(this.value)) {
      // update all elements
      if (indexes === 0) {
        this.value = this.value.map(() => val)
        return
      }

      const value = this.value as number[]
      indexList.forEach(index => {
        value[this.getRealIndex(index)] = val
      });
    } else {
      this.value = val
    }
  }

  print(): string {
    return Array.isArray(this.value) ? this.value.join(' | ') : `${this.value}`
  }

  private getRealIndex(index: number) {
    if (index === 0) {
      throw new Error(`There is no index 0, it's not cool!`)
    }
    return index - 1
  }

  increment() {
    if (Array.isArray(this.value)) {
      this.value = this.value.map(item => item + 1)
    } else {
      this.value += 1
    }
  }

  decrement() {
    if (Array.isArray(this.value)) {
      this.value = this.value.map(item => item - 1)
    } else {
      this.value -= 1
    }
  }
}

export default U8
